/*
 * Copyright © WebServices pour l'Éducation, 2017
 *
 * This file is part of ENT Core. ENT Core is a versatile ENT engine based on the JVM.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation (version 3 of the License).
 *
 * For the sake of explanation, any module that communicate over native
 * Web protocols, such as HTTP, with ENT Core is outside the scope of this
 * license and could be license under its own terms. This is merely considered
 * normal use of ENT Core, and does not fall under the heading of "covered work".
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

package org.entcore.workspace.controllers;

import fr.wseduc.webutils.Server;
import fr.wseduc.webutils.data.ZLib;
import fr.wseduc.webutils.request.CookieHelper;
import static fr.wseduc.webutils.request.filter.UserAuthFilter.SESSION_ID;

import net.sf.lamejb.*;
import net.sf.lamejb.impl.std.StreamEncoderWAVImpl;
import net.sf.lamejb.std.LameConfig;
import net.sf.lamejb.std.StreamEncoder;
import org.entcore.common.bus.WorkspaceHelper;
import org.entcore.common.storage.Storage;
import org.entcore.common.storage.StorageFactory;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.AsyncResult;
import org.vertx.java.core.AsyncResultHandler;
import org.vertx.java.core.Handler;
import org.vertx.java.core.Vertx;
import org.vertx.java.core.buffer.Buffer;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.http.ServerWebSocket;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import java.io.*;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.HashMap;
import java.util.Map;
import com.sun.jna.Platform;

public class AudioRecorderHandler implements Handler<ServerWebSocket> {

	private static final Logger log = LoggerFactory.getLogger(AudioRecorderHandler.class);
	private final Vertx vertx;
	private final Map<String, Buffer> buffers = new HashMap<>();
	private final Storage storage;
	private final WorkspaceHelper workspaceHelper;

	public AudioRecorderHandler(Vertx vertx, Storage storage) {
		this.vertx = vertx;
		this.storage = storage;
		this.workspaceHelper = new WorkspaceHelper(vertx.eventBus(), storage);
	}

	@Override
	public void handle(final ServerWebSocket ws) {
		ws.pause();
		String sessionId = CookieHelper.getInstance().getSigned(SESSION_ID, ws);
		UserUtils.getSession(Server.getEventBus(vertx), sessionId, new Handler<JsonObject>() {
			public void handle(final JsonObject infos) {
				if(infos == null){
					ws.reject();
					return;
				}
				final String id = ws.path().replaceFirst("/audio/", "");
				log.info("id : " + id);
				if (!buffers.containsKey(id)) {
					ws.dataHandler(new Handler<Buffer>() {
						@Override
						public void handle(Buffer event) {
							try {
								final Buffer buf = buffers.get(id);
								//final String base64 = event.toString("UTF-8").replaceFirst("data:(audio/wav)?;base64,", "");
								//Buffer tmp = new Buffer(Base64.decode(base64));
								Buffer tmp = new Buffer(ZLib.decompress(event.getBytes()));
								////tmp = tmp.getBuffer(44, tmp.length());
								if (buf != null) {
									buf.appendBuffer(tmp);
								} else {
									buffers.put(id, tmp);
								}
							} catch (Exception e) {
								log.error("Error receiving wav parts.", e);
								ws.close();
							}
						}
					});
					ws.closeHandler(new Handler<Void>() {
						@Override
						public void handle(Void event) {
							final Buffer buf = buffers.remove(id);
							if (buf != null) {
								try {
									final String name = "Capture " + System.currentTimeMillis() + ".mp3";
									storage.writeBuffer(id, toMp3(toWav(buf)), "audio/mp3",
											name, new Handler<JsonObject>() {
												@Override
												public void handle(JsonObject f) {
													if ("ok".equals(f.getString("status"))) {
														workspaceHelper.addDocument(f,
																UserUtils.sessionToUserInfos(infos), name, "mediaLibrary",
																true, new JsonArray(), new Handler<Message<JsonObject>>() {
															@Override
															public void handle(Message<JsonObject> event) {
																// TODO manage return
															}
														});
													} else {
														// TODO error
													}
												}
											});
								} catch (RuntimeException e) {
									log.error("Error writing audio capture.", e);
								}
//								vertx.fileSystem().writeFile("/tmp/" + id + ".mp3", toMp3(toWav(buf)),
//										new AsyncResultHandler<Void>() {
//											@Override
//											public void handle(AsyncResult<Void> event) {
//												if (event.failed()) {
//													log.error("Error write wav file", event.cause());
//												}
//											}
//										});
								//save(buf.getBuffer(44, buf.length()).getBytes());
								//save(buf.getBytes());
							}
						}
					});
				}
				ws.resume();
			}
		});
	}

	private static Buffer toWav(Buffer data) {
		Buffer wav = new Buffer();
		wav.appendString("RIFF");
		wav.appendBytes(intToByteArray(44 + data.length()));
		wav.appendString("WAVE");
		wav.appendString("fmt ");
		wav.appendBytes(intToByteArray(16));
		wav.appendBytes(shortToByteArray((short) 1));
		wav.appendBytes(shortToByteArray((short) 2));
		wav.appendBytes(intToByteArray(44100));
		wav.appendBytes(intToByteArray(44100 * 4));
		wav.appendBytes(shortToByteArray((short) 4));
		wav.appendBytes(shortToByteArray((short) 16));
		wav.appendString("data");
		wav.appendBytes(intToByteArray(data.length()));
		wav.appendBuffer(data);
		return wav;
	}

	private static byte[] shortToByteArray(short data) {
		return ByteBuffer.allocate(2).order(ByteOrder.LITTLE_ENDIAN).putShort(data).array();
	}

	private static byte[] intToByteArray(int i) {
		return ByteBuffer.allocate(4).order(ByteOrder.LITTLE_ENDIAN).putInt(i).array();
	}


	private static Buffer toMp3(Buffer wav) {
		final ByteArrayOutputStream baos = new ByteArrayOutputStream();
		final ByteArrayInputStream bais = new ByteArrayInputStream(wav.getBytes());
		final LamejbConfig config = new LamejbConfig(44100, 128, LamejbConfig.MpegMode.STEREO, true);
		if (Platform.isWindows()) {
			LamejbCodecFactory codecFactory = new BladeCodecFactory();
			LamejbCodec codec = codecFactory.createCodec();
			codec.encodeStream(bais, baos, config);
		} else {
			StreamEncoder encoder = new StreamEncoderWAVImpl(new BufferedInputStream(bais));
			LameConfig conf = encoder.getLameConfig();
			conf.setInSamplerate(config.getSampleRate());
			conf.setBrate(config.getBitRate());
			conf.setBWriteVbrTag(config.isVbrTag());
			conf.setMode(config.getMpegMode().lameMode());
			encoder.encode(new BufferedOutputStream(baos));
		}
		return new Buffer(baos.toByteArray());
	}

}
