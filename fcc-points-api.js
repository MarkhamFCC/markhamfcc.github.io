"use strict";
angular.module( "fccuserlistApp", [ "ngCookies", "ngResource", "ngSanitize", "ngRoute", "ui.bootstrap", "satellizer" ] )
	.config( [ "$authProvider", function( a ) {
		a.github( {
			clientId: "0e47c26bffd2418936fb",
			url: "/auth/github",
			authorizationEndpoint: "https://github.com/login/oauth/authorize",
			redirectUri: window.location.origin || window.location.protocol + "//" + window.location.host,
			optionalUrlParams: [ "scope" ],
			scope: [ "user:email" ],
			scopeDelimiter: " ",
			type: "2.0",
			popupOptions: {
				width: 1020,
				height: 618
			}
		} )
	} ] )
	.config( [ "$routeProvider", "$locationProvider", "$httpProvider", function( a, b, c ) {
		a.otherwise( {
			redirectTo: "/"
		} ), b.html5Mode( !0 )
	} ] ), angular.module( "fccuserlistApp" )
	.controller( "MainCtrl", [ "$scope", "$http", "$auth", "$location", function( a, b, c, d ) {
		a.campers = [], a.onRecentPage = !0, a.showingFollowing = !1, a.singleUser, a.me, a.notFound = !1, a.isLoggedIn = c
			.isAuthenticated, a.predicate = "totalRecent", a.reverse = !0, a.order = function( b ) {
				a.reverse = a.predicate === b ? !a.reverse : !0, a.predicate = b
			}, a.authenticate = function( b ) {
				c.authenticate( b )
					.then( a.getMe )
			}, a.getMe = function( c ) {
				b.get( "/auth/github/me" )
					.success( function( b ) {
						a.me = b
					} )
			}, a.handleEnter = function( b ) {
				var c = b.which || b.keyCode;
				13 === c && a.getUserRanking()
			}, a.getDataRecent = function() {
				a.recentActivity = "recent activity from ", a.singleUser = void 0, a.onRecentPage = !0, a.showingFollowing = !1,
					b.get( "/api/fccusers/top100/recent" )
					.success( function( b ) {
						a.reverse = !0, a.campers = b
					} )
			}, a.newPredicate = function() {
				return "username" === a.predicate ? a.predicate : "totalRecent" === a.predicate ? "total" : "total" === a.predicate ?
					"totalRecent" : "pointsRecent" === a.predicate ? "points" : "points" === a.predicate ? "pointsRecent" :
					"projectsRecent" === a.predicate ? "projects" : "projects" === a.predicate ? "projectsRecent" :
					"cummunityRecent" === a.predicate ? "cummunity" : "community" === a.predicate ? "communityRecent" :
					"totalRecent"
			}, a.getDataFollowing = function() {
				a.recentActivity = "recent activity from ", a.onRecentPage = !0, a.showingFollowing = !0, b.get(
						"/api/fccusers/following/recent/" + a.me.username )
					.success( function( b ) {
						a.campers = b
					} )
			}, a.getDataAlltime = function() {
				a.onRecentPage = !1, a.singleUser = void 0, a.showingFollowing = !1, b.get( "/api/fccusers/top100/alltime" )
					.success( function( b ) {
						a.reverse = !0, a.campers = b
					} )
			}, a.refreshUser = function( c ) {
				b.get( "/api/fccusers/update/" + c )
					.success( function() {
						setTimeout( function() {
							a.onRecentPage ? a.getDataRecent() : a.getDataAlltime(), a.$apply()
						}, 3e3 )
					} )
			}, a.followUser = function( c ) {
				"input" === c ? b.get( "/api/fccusers/verify/username/" + a.username )
					.then( function( d ) {
						var e = d.data;
						c = e.username, b.put( "/api/fccusers/follow/" + a.me.username + "/" + c )
							.success( function() {
								a.getMe()
							} )
					}, function( b ) {
						a.notFound = !0
					} ) : ( a.notFound = !1, b.put( "/api/fccusers/follow/" + a.me.username + "/" + c )
						.success( function() {
							a.getMe()
						} ) )
			}, a.unfollowUser = function( c ) {
				if ( a.showingFollowing )
					for ( var d = 0; d < a.campers.length; d++ )
						if ( a.campers[ d ].username === c ) {
							a.campers.splice( d, 1 );
							break
						}
				b.put( "/api/fccusers/unfollow/" + a.me.username + "/" + c )
					.success( function() {
						a.getMe()
					} )
			}, a.isFollowing = function( b ) {
				return a.me && a.me.username !== b && a.me.following.indexOf( b ) >= 0
			}, a.isNotFollowing = function( b ) {
				return a.me && a.me.username !== b && a.me.following.indexOf( b ) < 0
			}, a.getUserRanking = function() {
				return a.username ? ( a.notFound = !1, void b.get( "/api/fccusers/ranking-" + ( a.onRecentPage ? "r" : "o" ) +
						"/" + a.username )
					.then( function( b ) {
						a.singleUser = b.data
					}, function( b ) {
						a.notFound = !0
					} ) ) : !1
			}, a.isLoggedIn() && a.getMe(), a.getDataRecent()
	} ] ), angular.module( "fccuserlistApp" )
	.config( [ "$routeProvider", function( a ) {
		a.when( "/", {
			templateUrl: "app/main/main.html",
			controller: "MainCtrl"
		} )
	} ] ), angular.module( "fccuserlistApp" )
	.factory( "Auth", [ "$location", "$rootScope", "$http", "Fccuser", "$cookieStore", "$q", function( a, b, c, d, e, f ) {
		var g = {};
		return console.log( "Get token - Auth service" ), e.get( "token" ) && c.get( "/api/fccusers/me", function( a, b ) {
			return a ? a : void( g = d.get() )
		} ), {
			login: function( a ) {
				var b = a || angular.noop,
					h = f.defer();
				return c.get( "/auth/github" )
					.success( function( a ) {
						return e.put( "token", a.token ), g = d.get(), h.resolve( a ), b()
					} )
					.error( function( a ) {
						return this.logout(), h.reject( a ), b( a )
					}.bind( this ) ), h.promise
			},
			logout: function() {
				e.remove( "token" ), g = {}
			},
			getCurrentUser: function() {
				return g
			},
			isLoggedInAsync: function( a ) {
				console.log( "isLoggedInAsync", g ), g.hasOwnProperty( "$promise" ) ? g.$promise.then( function() {
					a( !0 )
				} )[ "catch" ]( function() {
					a( !1 )
				} ) : a( g.hasOwnProperty( "username" ) ? !0 : !1 )
			},
			isLoggedIn: function() {
				return g.hasOwnProperty( "username" )
			},
			getToken: function() {
				return e.get( "token" )
			}
		}
	} ] ), angular.module( "fccuserlistApp" )
	.factory( "Fccuser", [ "$resource", function( a ) {
		return a( "/api/fccusers/:id", {
			id: "@username"
		}, {
			get: {
				method: "GET",
				params: {
					id: "me"
				}
			}
		} )
	} ] ), angular.module( "fccuserlistApp" )
	.run( [ "$templateCache", function( a ) {
		a.put( "app/main/main.html",
			'<header class=header><a href=http://www.freecodecamp.com><img class=fcclogo src=https://s3.amazonaws.com/freecodecamp/freecodecamp_logo.svg alt="FreeCodeCamp logo"></a><div class="right greeting" ng-show=isLoggedIn()>Hello {{me.username}}</div><div class=right ng-hide=isLoggedIn()><button ng-click="authenticate(\'github\')" class="btn btn-lg btn-block btn-github btn-social"><i class="fa fa-github"></i>Log in with Github</button></div></header><div class=container><div class=row><div class=col-md-12><table class="table table-striped table-bordered"><tr><th id=header colspan=9><h3 ng-show=onRecentPage>(unofficial) Leaderboard over last 30 days activity</h3><a href=# class=small-link ng-click=getDataAlltime() ng-show=onRecentPage>All Time leaderboard</a><h3 ng-hide=onRecentPage>(unofficial) All Time Leaderboard</h3><a href=# class=small-link ng-click=getDataRecent() ng-hide=onRecentPage>30 days leaderboard</a></th></tr><tr class=top100 ng-show=isLoggedIn()><td colspan=9>You\'re following:&nbsp;&nbsp;<span ng-repeat="follow in me.followimg"><img ng-src={{follow}} class="userimg"></span><button class="btn rank-btn" ng-click=getDataFollowing() ng-hide=showingFollowing>Show Following</button><button class="btn rank-btn" ng-click=getDataRecent() ng-show=showingFollowing>Show Top 100</button></td></tr><tr class=top100><td colspan=9><div class=single><span>Not listed below? Get your own ranking here:</span> <input placeholder=Username ng-model=username ng-keypress=handleEnter($event)> <button class="btn rank-btn" ng-click=getUserRanking()>Get ranking</button> <button ng-show=isLoggedIn() ng-click="followUser(\'input\')" class="btn rank-btn">Follow</button></div></td></tr><tr ng-show=notFound class=top100><td colspan=9><span>No ranking found for {{username}}</span></td></tr><tr ng-show="singleUser && !notFound" class=top100><td>{{singleUser.ranking}}</td><td><a href=http://www.freecodecamp.com/{{singleUser.username}} target=_blank><img ng-src={{singleUser.img}} class="userimg"> <span class=user-name>{{singleUser.username}}</span></a></td><td class=count><span ng-show=onRecentPage>{{singleUser.totalRecent}}</span><span ng-hide=onRecentPage>{{singleUser.total}}</span></td><td class=count><span ng-show=onRecentPage>{{singleUser.pointsRecent}}</span><span ng-hide=onRecentPage>{{singleUser.points}}</span></td><td class=count><span ng-show=onRecentPage>{{singleUser.projectsRecent}}</span><span ng-hide=onRecentPage>{{singleUser.projects}}</span></td><td class=count><span ng-show=onRecentPage>{{singleUser.cummunityRecent}}</span><span ng-hide=onRecentPage>{{singleUser.community}}</span></td><td class=count><span ng-show=onRecentPage>{{singleUser.total}}</span><span ng-hide=onRecentPage>{{singleUser.totalRecent}}</span></td><td class=lastchecked>{{singleUser.lastUpdate | date:\'yyyy-MM-dd HH:mm:ss\'}}</td><td class=buttons><button class="btn btn-default" ng-click=refreshUser(singleUser.username)><i class="glyphicon glyphicon-refresh"></i></button></td></tr><tr ng-show=onRecentPage><th class=idcol>#</th><th><a href="" ng-click="order(\'username\')">Camper Name</a> <span class=sortorder ng-show="predicate === \'username\'" ng-class={reverse:reverse}></span></th><th class=numbercol><a href="" ng-click="order(\'totalRecent\')">Recent score</a> <span class=sortorder ng-show="predicate === \'totalRecent\'" ng-class={reverse:reverse}></span></th><th class=numbercol><a href="" ng-click="order(\'pointsRecent\')">Points</a> <span class=sortorder ng-show="predicate === \'pointsRecent\'" ng-class={reverse:reverse}></span></th><th class=numbercol><a href="" ng-click="order(\'projectsRecent\')">Projects (x50)</a> <span class=sortorder ng-show="predicate === \'projectsRecent\'" ng-class={reverse:reverse}></span></th><th class=numbercol><a href="" ng-click="order(\'communityRecent\')">Help Score</a> <span class=sortorder ng-show="predicate === \'communityRecent\'" ng-class={reverse:reverse}></span></th><th class=numbercol><a href="" ng-click="order(\'total\')">Overall score</a> <span class=sortorder ng-show="predicate === \'total\'" ng-class={reverse:reverse}></span></th><th class=lastchecked>Last checked</th><th class=buttons ng-class=isLoggedIn()></th></tr><tr ng-hide=onRecentPage><th class=idcol>#</th><th><a href="" ng-click="order(\'username\')">Camper Name</a> <span class=sortorder ng-show="predicate === \'username\'" ng-class={reverse:reverse}></span></th><th class=numbercol><a href="" ng-click="order(\'total\')">Overall score</a> <span class=sortorder ng-show="predicate === \'total\'" ng-class={reverse:reverse}></span></th><th class=numbercol><a href="" ng-click="order(\'points\')">Points</a> <span class=sortorder ng-show="predicate === \'points\'" ng-class={reverse:reverse}></span></th><th class=numbercol><a href="" ng-click="order(\'projects\')">Projects (x50)</a> <span class=sortorder ng-show="predicate === \'projects\'" ng-class={reverse:reverse}></span></th><th class=numbercol><a href="" ng-click="order(\'community\')">Help score</a> <span class=sortorder ng-show="predicate === \'community\'" ng-class={reverse:reverse}></span></th><th class=numbercol><a href="" ng-click="order(\'totalRecent\')">Recent score</a> <span class=sortorder ng-show="predicate === \'totalRecent\'" ng-class={reverse:reverse}></span></th><th class=lastchecked>Last checked</th><th class=buttons ng-class=isLoggedIn()></th></tr><tr class=top100 ng-repeat="camper in campers | orderBy:predicate:reverse | limitTo:100"><td>{{$index+1}}</td><td><a href=http://www.freecodecamp.com/{{camper.username}} target=_blank><img ng-src={{camper.img}} class="userimg"> <span class=user-name>{{camper.username}}</span></a></td><td class=count><span ng-show=onRecentPage>{{camper.totalRecent}}</span><span ng-hide=onRecentPage>{{camper.total}}</span></td><td class=count><span ng-show=onRecentPage>{{camper.pointsRecent}}</span><span ng-hide=onRecentPage>{{camper.points}}</span></td><td class=count><span ng-show=onRecentPage>{{camper.projectsRecent}}</span><span ng-hide=onRecentPage>{{camper.projects}}</span></td><td class=count><span ng-show=onRecentPage>{{camper.communityRecent}}</span><span ng-hide=onRecentPage>{{camper.community}}</span></td><td class=count><span ng-show=onRecentPage>{{camper.total}}</span><span ng-hide=onRecentPage>{{camper.totalRecent}}</span></td><td class=lastchecked>{{camper.lastUpdate | date:\'yyyy-MM-dd HH:mm:ss\'}}</td><td class=buttons ng-class=isLoggedIn()><button class="btn btn-default" ng-click=refreshUser(camper.username)><i class="glyphicon glyphicon-refresh"></i></button> <button class="btn btn-default" ng-show="isLoggedIn() && isNotFollowing(camper.username)" ng-click=followUser(camper.username)><i class="glyphicon glyphicon-thumbs-up"></i></button> <button class="btn btn-default" ng-show="isLoggedIn() && isFollowing(camper.username)" ng-click=unfollowUser(camper.username)><i class="glyphicon glyphicon-thumbs-down"></i></button></td></tr><tr><td colspan=10>This list is assembled by taking a list of users from the <a href=https://gitter.im/FreeCodeCamp/FreeCodeCamp>FreeCodeCamp chat</a> and screen scraping <span ng-show=onRecentPage>recent activity</span>from the user\'s detail pages from the FreeCodeCamp site. This list is updated every couple of days. It is not a realtime presentation of user scores on FreeCodeCamp.com.<br>The list is ordered by descending total score. This score is calculated as <em>Points + (projects * 50)</em>.<br>Take a look at the <span ng-show=onRecentPage><a href=# ng-click=getDataAlltime()>All Time Leaderboard</a></span><span ng-hide=onRecentPage><a href=# ng-click=getDataRecent()>Recent activity leaderboard</a></span>.</td></tr></table></div></div></div><footer class=footer><div class=container><p>*** By <a href=http://www.freecodecamp.com/roelver>@roelver</a> ***</p></div></footer>'
		)
	} ] );