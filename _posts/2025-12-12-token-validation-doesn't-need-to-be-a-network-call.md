---
layout: post
title: "token validation doesn't need to be a network call" 
date: 2025-12-12
categories: meta
---
> building your own auth control plane: a pragmatic analysis before you buy

there's a moment in every growing company when someone suggests using a managed authentication platform. it's a reasonable suggestion. these platforms exist. they're stable. they have funding. they have teams of people thinking about security.

and then you realize you're going to need to customize almost everything about it.

## start by asking what you're actually solving

before you even look at a platform, sit down with your architecture and ask a specific question: what percentage of my auth problem is "i need to sign tokens" versus "i need to decide who gets tokens and what they can do with them?"

the first part is 15 percent of the work. it's also the part that every platform does. rsa signatures, jwt encoding, key rotation. this is solved. genuinely solved. you don't need to think about it.

the second part is 85 percent of the work. and that's where managed platforms start getting interesting because they're not actually built for the shape of your problem.

think about what you need to decide:
- which client is calling this endpoint and should they be allowed?
- has this token been revoked since i last checked?
- how many tokens has this client issued in the last minute?
- what happens when a user logs in via our old identity provider but we want to migrate them to a new one?
- can i add a custom claim to tokens without restructuring my entire integration?
- if i need to revoke all tokens for a compromised client, how fast can i do it?

these aren't authentication questions. they're policy questions. and every organization has different answers.

## the hidden tax of "just use the platform"

here's what actually happens when you integrate a managed auth platform into a microservice architecture.

your identity provider issues a token with a specific format. your services need to validate it. you have two choices:

option one: every service calls the platform's validation endpoint on every request. this works until you do the math. you've got fifty services, each handling a thousand requests per second. that's fifty thousand validation calls per second going to someone else's infrastructure. your auth latency is now their network latency plus their database latency. you also now have a very specific dependency: if their validation endpoint is slow, your entire system is slow.

option two: you cache the validation decision locally. now you're managing cache invalidation. you're managing staleness. you're hoping that when a token gets revoked, the revocation propagates before someone uses a cached validation result. you're also managing the consistency model. if a token gets revoked and a service has a stale cache entry, what happens? this is where the operational overhead starts compounding.

neither option is wrong, but both have costs. costs that a platform doesn't really talk about when they're trying to sign you up.

then there's the feature gap. you want to issue tokens with different ttls based on the client's tier. the platform has one ttl setting. so you write code to adjust tokens after the fact. you want to track which client issued how many tokens. the platform logs this somewhere, but getting the data out requires hitting their api or exporting everything. you want to add a scope-based rate limit. they have rate limiting, but it's per user, not per scope.

what you're building is a shadow auth system. you're running their auth in parallel with custom code that makes it do what you need. and now you've got two systems to maintain instead of one.

## what you actually control when you own it

let's think about what changes when you decide to build the token policy layer yourself.

first, the schema becomes your design problem. you're not fitting your needs into their token structure. you're designing a token structure that fits your needs. need custom claims? add them. need tenant information? add it. need a way to encode the service tier that issued the token? you control that.

second, validation becomes your operational responsibility. but that also means you control it completely. you can validate tokens in-process using your service's public key. zero network hops. zero cache inconsistency problems. your validation latency is bounded by your crypto library, which is typically microseconds.

third, the audit trail becomes actually queryable. you design the schema. you decide what gets logged. you can ask questions like "how many tokens did client x issue yesterday?" without exporting anything. you can ask "which services called which services?" without reconstructing it from logs. this matters more than you think when you need to investigate a security incident.

fourth, revocation becomes something you control. want to revoke a token in under a second? you can. want to revoke all tokens for a client immediately? you can. want a revocation that cascades to related tokens? you can implement that. managed platforms give you revocation, but it's revocation designed for their general case, not your specific case.

## the token exchange layer you're going to need anyway

here's a scenario that every company with multiple auth systems eventually faces.

you've got users logging in via your enterprise identity provider. you've also got internal services that need to act on behalf of users. you've got api clients that are third-party integrations. they all need different tokens, or at least tokens with different claims.

the naive approach is to pass the external token all the way through your stack. every service validates it. every service extracts claims from it. but now your internal contract depends on the external provider's token format. when you want to switch providers, you're touching every service. when you want to add an internal claim, you can't, because the token format is locked.

the better approach is token exchange. your user logs in with the external provider and gets a token. they send that token to your auth service. your auth service verifies it with the external provider, extracts what you care about, and mints a new token in your internal format.

now your services never see external tokens. they only see internal tokens. which means you can change identity providers without touching your services. you can add custom claims. you can add scopes. you can add whatever internal structure makes sense.

this isn't a novel idea. it's literally part of the oauth spec. but most managed auth platforms don't think about this pattern because they're trying to be the identity provider, not a layer on top of identity providers.

when you own this layer, you can implement it in a weekend. you need to verify a jwt with an external provider's jwks endpoint, extract claims, and mint your own token. that's maybe two hundred lines of code. the complexity is in the operational semantics, not the implementation.

## designing the service with clear eyes

if you're going to do this, think about what the service actually needs to do.

issuing tokens: a client calls with credentials, you verify them, you issue a token. that's one endpoint.

validating tokens: a service calls with a token, you verify the signature and check if it's revoked. that's one endpoint.

exchanging tokens: an external token comes in, you verify it with the external provider, you issue an internal token. that's one endpoint.

refreshing tokens: a client calls with a refresh token, you issue a new access token. that's one endpoint.

revoking tokens: a client calls saying this token should be invalid. you record it. that's one endpoint.

that's the core api. everything else is supporting infrastructure.

the database is simple. a clients table for who can get tokens. a tokens table for metadata about issued tokens. a revocation table for what's been revoked. an audit table for compliance. indices on the obvious fields. maybe a rate limit tracking table if you want per-minute limits.

the token format is straightforward. an issuer claim. a subject claim identifying the client or user. a scope list if you care about scopes. an expiry. optionally custom claims for context. a jwt id for revocation tracking.

none of this is complex. none of this requires specialized knowledge. what it requires is being clear about what you need and building exactly that, nothing more.

## the operational characteristics matter more than you think

when you build this yourself, you're committing to understanding how it works and being on call for when it breaks. this is worth thinking about.

but here's the thing: you're going to be on call for auth anyway. whether you own it or not, you need to understand it well enough to debug it when it's broken. and when something breaks in a managed platform, you're debugging without visibility. you're sending support tickets. you're hoping the platform team understands your use case.

when you own it, you're debugging your own code. which is generally faster.

the operational burden is real, but it's probably less than you think. a service with one job tends to be stable. it's not doing complex business logic. it's signing tokens and checking revocation lists. the failure modes are pretty limited. bad credentials. database down. network partition.

the tooling you need is standard. async http server. database. crypto library. structured logging. metrics. all of this exists and is boring. deploy it on your infrastructure like any other service.

## the moment you realize this is the right call

you'll know you should do this when you find yourself in one of these situations:

you're using a managed platform and you discover that adding a custom claim requires redeploying all your services that rely on the claim structure.

you're using a managed platform and you need to change how tokens are issued for a specific tier of clients, but the platform's configuration doesn't support tier-specific behavior.

you're using a managed platform and you want to switch identity providers next quarter, but that's going to require rewriting integration code in ten different services.

you're using a managed platform and you realize that your audit and compliance team needs query access to token decisions that aren't exposed through the api.

you're using a managed platform and you calculate that the cost of validation calls plus the operational overhead of caching plus the cost of custom code you're writing anyway is more than the cost of just owning it.

any one of these is a sign that the platform's generality is working against you. at that point, you're not getting leverage from managed auth. you're fighting it.

## how to think about building this

if you decide to do it, don't overthink the implementation. the goal isn't to build a platform. the goal is to build a service that solves your specific problem.

start with the core four endpoints: issue, validate, revoke, refresh. get those working. get them tested. deploy them.

add token exchange when you need it. it's one more endpoint. it adds complexity around external provider integration, but that complexity is localized.

add rate limiting when you need it. it's tracking counts in time windows. standard stuff.

add audit logging when you need it. it's writing documents to a collection. standard stuff.

add custom policies when you need them. if you want different ttls for different tiers, that's logic in the issue endpoint. if you want custom revocation cascading, that's logic in the revoke endpoint.

build it incrementally. use boring technology. use a language you know well. use a database you understand. use standard libraries for crypto. the whole point is to be able to understand every line and every decision.

## what you're actually betting on

when you decide to build this instead of using a platform, you're not betting that you can do it better than the platform team. you're betting that you can do it better for your specific constraints.

you're betting that understanding your own auth system is worth the engineering time. that having full visibility into token decisions is worth maintaining a service. that being able to iterate on auth policy without platform limitations is worth the operational overhead.

these are reasonable bets if you're at a certain scale and certain level of architectural sophistication. they're not reasonable bets if you're small or if your auth needs are simple.

but if you're reading this because you're already frustrated with a platform, if you're already writing custom code to work around platform limitations, if you're already maintaining integration code that's basically a shadow auth system, then you're not really betting on building your own anymore. you're already maintaining your own. you're just doing it in a way that's split between their code and your code.

at that point, consolidation is probably the right move.

## the thing nobody mentions

here's what makes this work in practice: once you own the token validation, you own the validation latency. validation happens locally. it's not a network call. it's not a cache hit or miss. it's your service's public key and your service's crypto library.

this changes what's possible architecturally. services can be strict about validation because validation is fast. you can add validation to endpoints that wouldn't normally have it because there's no performance penalty. you can iterate on token structure because you only need to update your service and the places that consume tokens.

it's not flashy. it's not the kind of thing that makes for impressive architecture diagrams. but it's the kind of thing that makes systems feel responsive and makes teams feel like they're not fighting their infrastructure.

## closing without wrapping up too much

the decision to build versus buy is ultimately about honesty.

be honest about how much of the platform you actually use. be honest about how much code you're writing to work around platform limitations. be honest about what your compliance and operational teams actually need. be honest about whether the platform's defaults align with your architecture or work against it.

if you're honest about those things, the decision usually becomes pretty clear.

and if you do decide to build it, remember that you're not building an identity platform. you're building a token policy service. keep it small. keep it focused. keep it yours.

the platforms aren't going anywhere. if you decide this isn't worth it, you can always switch later. but at least you'll have made the decision with your eyes open, understanding the actual shape of your problem instead of fitting your problem into someone else's shape.
