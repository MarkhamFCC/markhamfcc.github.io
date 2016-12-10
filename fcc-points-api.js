"use strict";
angular.module("fccuserlistApp", ["ngCookies", "ngResource", "ngSanitize", "ngRoute", "ui.bootstrap", "satellizer"]).config(["$authProvider", function(a) {
    a.github({
      clientId: "0e47c26bffd2418936fb",
      url: "/auth/github",
      authorizationEndpoint: "https://github.com/login/oauth/authorize",
      redirectUri: window.location.origin || window.location.protocol + "//" + window.location.host,
      optionalUrlParams: ["scope"],
      scope: ["user:email"],
      scopeDelimiter: " ",
      type: "2.0",
      popupOptions: {
        width: 1020,
        height: 618
      }
    })
  }]).config(["$routeProvider", "$locationProvider", "$httpProvider", function(a, b, c) {
    a.otherwise({
      redirectTo: "/"
    }), b.html5Mode(!0)
  }]), angular.module("fccuserlistApp").controller("MainCtrl", ["$scope", "$http", "$auth", "$location", function(a, b, c, d) {
    a.campers = [], a.onRecentPage = !0, a.showingFollowing = !1, a.singleUser, a.me, a.notFound = !1, a.isLoggedIn = c.isAuthenticated, a.predicate = "totalRecent", a.reverse = !0, a.order = function(b) {
      a.reverse = a.predicate === b ? !a.reverse : !0, a.predicate = b
    }, a.authenticate = function(b) {
      c.authenticate(b).then(a.getMe)
    }, a.getMe = function(c) {
      b.get("/auth/github/me").success(function(b) {
        a.me = b
      })
    }, a.handleEnter = function(b) {
      var c = b.which || b.keyCode;
      13 === c && a.getUserRanking()
    }, a.getDataRecent = function() {
      a.recentActivity = "recent activity from ", a.singleUser = void 0, a.onRecentPage = !0, a.showingFollowing = !1, b.get("/api/fccusers/top100/recent").success(function(b) {
        a.reverse = !0, a.campers = b
      })
    }, a.newPredicate = function() {
      return "username" === a.predicate ? a.predicate : "totalRecent" === a.predicate ? "total" : "total" === a.predicate ? "totalRecent" : "pointsRecent" === a.predicate ? "points" : "points" === a.predicate ? "pointsRecent" : "projectsRecent" === a.predicate ? "projects" : "projects" === a.predicate ? "projectsRecent" : "cummunityRecent" === a.predicate ? "cummunity" : "community" === a.predicate ? "communityRecent" : "totalRecent"
    }, a.getDataFollowing = function() {
      a.recentActivity = "recent activity from ", a.onRecentPage = !0, a.showingFollowing = !0, b.get("/api/fccusers/following/recent/" + a.me.username).success(function(b) {
        a.campers = b
      })
    }, a.getDataAlltime = function() {
      a.onRecentPage = !1, a.singleUser = void 0, a.showingFollowing = !1, b.get("/api/fccusers/top100/alltime").success(function(b) {
        a.reverse = !0, a.campers = b
      })
    }, a.refreshUser = function(c) {
      b.get("/api/fccusers/update/" + c).success(function() {
        setTimeout(function() {
          a.onRecentPage ? a.getDataRecent() : a.getDataAlltime(), a.$apply()
        }, 3e3)
      })
    }, a.followUser = function(c) {
      "input" === c ? b.get("/api/fccusers/verify/username/" + a.username).then(function(d) {
        var e = d.data;
        c = e.username, b.put("/api/fccusers/follow/" + a.me.username + "/" + c).success(function() {
          a.getMe()
        })
      }, function(b) {
        a.notFound = !0
      }) : (a.notFound = !1, b.put("/api/fccusers/follow/" + a.me.username + "/" + c).success(function() {
        a.getMe()
      }))
    }, a.unfollowUser = function(c) {
      if (a.showingFollowing)
        for (var d = 0; d < a.campers.length; d++)
          if (a.campers[d].username === c) {
            a.campers.splice(d, 1);
            break
          }
      b.put("/api/fccusers/unfollow/" + a.me.username + "/" + c).success(function() {
        a.getMe()
      })
    }, a.isFollowing = function(b) {
      return a.me && a.me.username !== b && a.me.following.indexOf(b) >= 0
    }, a.isNotFollowing = function(b) {
      return a.me && a.me.username !== b && a.me.following.indexOf(b) < 0
    }, a.getUserRanking = function() {
      return a.username ? (a.notFound = !1, void b.get("/api/fccusers/ranking-" + (a.onRecentPage ? "r" : "o") + "/" + a.username).then(function(b) {
        a.singleUser = b.data
      }, function(b) {
        a.notFound = !0
      })) : !1
    }, a.isLoggedIn() && a.getMe(), a.getDataRecent()
  }]), angular.module("fccuserlistApp").config(["$routeProvider", function(a) {
    a.when("/", {
      templateUrl: "app/main/main.html",
      controller: "MainCtrl"
    })
  }]), angular.module("fccuserlistApp").factory("Auth", ["$location", "$rootScope", "$http", "Fccuser", "$cookieStore", "$q", function(a, b, c, d, e, f) {
    var g = {};
    return console.log("Get token - Auth service"), e.get("token") && c.get("/api/fccusers/me", function(a, b) {
      return a ? a : void(g = d.get())
    }), {
      login: function(a) {
        var b = a || angular.noop,
          h = f.defer();
        return c.get("/auth/github").success(function(a) {
          return e.put("token", a.token), g = d.get(), h.resolve(a), b()
        }).error(function(a) {
          return this.logout(), h.reject(a), b(a)
        }.bind(this)), h.promise
      },
      logout: function() {
        e.remove("token"), g = {}
      },
      getCurrentUser: function() {
        return g
      },
      isLoggedInAsync: function(a) {
        console.log("isLoggedInAsync", g), g.hasOwnProperty("$promise") ? g.$promise.then(function() {
          a(!0)
        })["catch"](function() {
          a(!1)
        }) : a(g.hasOwnProperty("username") ? !0 : !1)
      },
      isLoggedIn: function() {
        return g.hasOwnProperty("username")
      },
      getToken: function() {
        return e.get("token")
      }
    }
  }]), angular.module("fccuserlistApp").factory("Fccuser", ["$resource", function(a) {
    return a("/api/fccusers/:id", {
      id: "@username"
    }, {
      get: {
        method: "GET",
        params: {
          id: "me"
        }
      }
    })
  }]), angular.module("fccuserlistApp").run(["$templateCache", function(a) {
        a.put("app/main/main.html", '') }]);