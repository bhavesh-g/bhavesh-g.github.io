---
layout: post
title: "the unavoidable evolution of identity systems"
date: 2026-04-25
categories: meta
---
> state, scale, and cached lies.
 
we argue about tokens when we should be arguing about topology. here is how your architecture actually forces your hand.

most identity writing starts too late. 

by the time your engineering team is locked in a meeting room debating the merits of jwts against opaque tokens, the most critical architectural constraints have already been locked in. the servers are distributed. the latency budgets are tight. security is screaming for instant revocation while product is demanding a seamless, invisible login experience. 

identity is not a menu of isolated design patterns you pick from. it is a sequence of forced responses to friction. every new layer in your stack exists solely because the simpler model before it buckled under the weight of scale. 

if you want to understand why our systems look the way they do, you have to watch them break.

### the friction of compute

think back to the simplest version of your app. one backend server, one database. a request comes in, the server hashes the provided password, checks it against the database, and serves the payload. the system that knows the truth is the exact same system enforcing it. identity is not a domain here; it is just a sql query.

but you hit your first wall almost immediately. cryptographic password hashing is intentionally slow. running a bcrypt validation on every single http request will melt your cpu. asking a user for multi-factor authentication on every click will ruin your product. 

so, you compromise. you decide to perform the expensive mathematical proof exactly once, record the result in memory, and hand the client a random string to represent that successful check. 

you just invented the session. 

the cookie is not the identity. it is just a pointer to a cached decision. you traded compute cycles for memory space, and it works perfectly... until you need a second server.

### the friction of state

traffic spikes. you put ten application instances behind a load balancer. suddenly, a user logs in on node a, but their next api call lands on node b. node b has no idea who they are because the session state is trapped in node a's memory. continuity shatters.

the obvious engineering fix is to pull that state out of the application and put it into a shared central store like redis. now, any node can verify the session.

but look at what you just did to your architecture. your identity store is now sitting directly in the critical path of every single request. if your api spans multiple regions, latency creeps up as nodes reach across the country to verify a session. if the cache cluster blips, the entire platform goes down. you solved the memory isolation problem, but you created a massive central bottleneck.

in distributed systems, local decisions are cheap, but central coordination is expensive. the next evolution has to preserve trust without making a network call.

### the friction of network and the cached lie

if your microservices cannot afford to constantly phone home to a central database, the proof of trust must travel alongside the request itself. you need a way for the auth server to make a statement that any downstream service can verify completely offline.

this is exactly how jwt enters your stack. 

you package the user claims, sign them with a private key, and hand the package to the client. when a microservice receives that token, it does not look it up in a database. it simply runs a deterministic mathematical check using a public key. if the math checks out, the token is trusted. you just eliminated the central bottleneck. 

but then a real-world scenario hits. it is 2:00 pm, and a rogue employee is terminated. hr deletes their account. but their jwt was issued at 1:00 pm and does not expire until 5:00 pm. the token is cryptographically flawless, but operationally toxic. the ex-employee spends the next three hours pulling internal repositories.

this is the hard lesson of stateless tokens. a signature only proves the token was issued correctly in the past. it guarantees integrity, not freshness. a jwt is essentially a cached lie with an expiration date. you are now stuck managing this gap, balancing agonizingly short token lifetimes against complex refresh flows, just to simulate the instant revocation you used to get for free with sessions.

### the friction of trust boundaries

eventually, your application becomes a platform. a third-party partner wants to build an integration that syncs user data. 

historically, users solved this by just giving the partner their raw password. that is a structural disaster. a password is absolute authority. you cannot scope it, you cannot restrict it to "read-only," and sharing it collapses your entire security perimeter.

you need a valet key. you need a way to grant a limited, highly specific capability without transferring primary credentials. 

this forces the adoption of oauth. it fundamentally separates the proof of who you are from what you are allowed to do. the user authenticates with your central server, and the third party receives a token that only allows them to read calendar events for the next hour. you stop sharing identity secrets and start issuing constrained capabilities.

### the friction of sprawl

fast forward a few years. your company has grown. you now have an internal wiki, an expense portal, a ci/cd dashboard, and a dozen other tools. 

if every single one of those applications maintains its own local user database and login screen, the operational overhead becomes crushing. when an engineer leaves the company, it has to manually hunt down and revoke access across twenty different systems. a single missed account is a critical security breach waiting to happen.

you realize that managing identity per application does not scale. you have to centralize authentication the same way you centralized your logging or your network routing. 

this is where sso becomes inevitable. you abstract the authentication layer entirely. the internal apps no longer care about passwords; they just trust the central identity provider. the visible benefit to the user is fewer login prompts. the actual engineering reality is a single, unified control plane for risk.

### designing for reality

sessions, stateless tokens, delegated access, and federation are not competing ideologies. they are an evolutionary chain. they solve the distinct consequences of scaling up compute, state, network, and organizational sprawl.

the hard part of identity architecture is not proving who a user is on the first click. the hard part is deciding where the truth lives, how long you are willing to let downstream systems cache it, and exactly how much latency you are willing to pay to revoke it when things go wrong.
