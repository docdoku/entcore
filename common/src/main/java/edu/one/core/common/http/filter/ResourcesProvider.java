package edu.one.core.common.http.filter;

import edu.one.core.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;

import edu.one.core.infra.http.Binding;

public interface ResourcesProvider {

	void authorize(HttpServerRequest resourceRequest, Binding binding,
				   UserInfos user, Handler<Boolean> handler);

}
