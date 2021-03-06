/* Copyright © WebServices pour l'Éducation, 2014
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
 *
 */

package org.entcore.common.appregistry;


public final class AppRegistryEvents {

	public static final String APP_REGISTRY_PUBLISH_ADDRESS = "app.registry.events";

	public static final String PROFILE_GROUP_ACTIONS_UPDATED = "PROFILE_GROUP_ACTIONS_UPDATED";

	public static final String USER_GROUP_UPDATED = "USER_GROUP_UPDATED";

	public static final String IMPORT_SUCCEEDED = "IMPORT_SUCCEEDED";

	private AppRegistryEvents() {}

}
