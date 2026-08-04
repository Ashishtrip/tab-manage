import { Server } from "socket.io";
import jwt from 'jsonwebtoken';
import Device from '../features/devices/devices.model.js';
import PendingHandoff from '../features/handoff/pendingHandoffs.model.js';
import { registerTabHandlers } from "../features/tabs/tabs.socket.js";
import { registerFolderHandlers } from "../features/folders/folders.socket.js";
import { registerWindowsHandlers } from "../features/windows/windows.socket.js";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret';

export default function initializeSocket(server) {
	const io = new Server(server, {
		cors: { origin: "*" }
	});

	io.use((socket, next) => {
		try {
			// Extract token from query or auth payload (depends on client setup)
			const token = socket.handshake.auth?.token || socket.handshake.query?.token;
			if (!token) {
				return next(new Error("Authentication error: No token provided"));
			}
			const decoded = jwt.verify(token, ACCESS_SECRET);
			socket.userId = decoded.userId;
			next();
		} catch (err) {
			next(new Error("Authentication error: Invalid token"));
		}
	});

	io.on("connection", (socket) => {
		console.log("Client connected:", socket.id, "User:", socket.userId);
		
		// Join user-specific room for cross-device broadcasting
		if (socket.userId) {
			socket.join(`user_${socket.userId}`);
		}

		// Handle Device Registration
		socket.on("register_device", async (deviceInfo) => {
			try {
				const { deviceId, deviceName, os, browser } = deviceInfo;
				if (!deviceId) return;
				
				socket.deviceId = deviceId; // attach to socket for disconnect handler

				await Device.findOneAndUpdate(
					{ userId: socket.userId, deviceId },
					{ 
						deviceName, 
						os, 
						browser, 
						isOnline: true, 
						socketId: socket.id,
						lastActive: new Date()
					},
					{ upsert: true, new: true }
				);

				// Broadcast to other devices that this user owns
				io.to(`user_${socket.userId}`).emit("devices_updated");

				// Check for pending handoffs
				const pending = await PendingHandoff.find({ targetDeviceId: deviceId }).populate('tabId');
				if (pending.length > 0) {
					socket.emit("receive_handoff", pending);
					await PendingHandoff.deleteMany({ targetDeviceId: deviceId });
				}
			} catch (err) {
				console.error("Error registering device:", err);
			}
		});

		// Handle Handoff
		socket.on("handoff_tab", async (data) => {
			try {
				const { targetDeviceId, tabData } = data;
				const targetDevice = await Device.findOne({ userId: socket.userId, deviceId: targetDeviceId });
				
				if (targetDevice && targetDevice.isOnline && targetDevice.socketId) {
					// Send immediately
					io.to(targetDevice.socketId).emit("receive_handoff", [tabData]);
				} else {
					// Save as pending if offline or not found
					await PendingHandoff.create({
						targetDeviceId,
						tabId: tabData._id
					});
				}
			} catch (err) {
				console.error("Error handling handoff:", err);
			}
		});

		registerTabHandlers(io, socket);
		registerFolderHandlers(io, socket);
		registerWindowsHandlers(io, socket);

		socket.on("disconnect", async () => {
			console.log("Client disconnected:", socket.id);
			if (socket.userId && socket.deviceId) {
				try {
					await Device.findOneAndUpdate(
						{ userId: socket.userId, deviceId: socket.deviceId },
						{ isOnline: false, lastActive: new Date() }
					);
					io.to(`user_${socket.userId}`).emit("devices_updated");
				} catch (err) {
					console.error("Error updating device status on disconnect:", err);
				}
			}
		});
	});
}
