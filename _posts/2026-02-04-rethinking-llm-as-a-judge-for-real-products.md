---
layout: post
title: "rethinking llm-as-a-judge for real products"
date: 2026-02-04
categories: meta
---

> when preset metrics lie to you

there is a moment every llm engineer quietly dreads.

a pm asks, "so... did the new ranking logic make answers better?"

the dashboard shows:
- rouge-l: +4%  
- bleu: +7%  
- exact match: unchanged  

but when you read real conversations, users are confused. support tickets keep climbing. the "improvement" is just noise.

this post is about that gap. why preset metrics fail. and why custom llm-as-a-judge metrics, built around your product's real definition of good, are the only way out.

## why classic metrics feel right but are wrong

bleu, rouge, exact match, token f1. they come from a simple world.

small test sets. one ground truth answer. short outputs. goal is similarity to reference.

translation or summarization? fine. llm products? no.

we build systems that explain. reason. obey tone, compliance, safety rules. balance correctness, brevity, style.

rouge cannot spot a legal chatbot breaking policy. bleu misses a code assistant suggesting a vuln. exact match ignores if a summary skips the key clause.

metrics give clean numbers. but deeper the product, less those numbers match what users feel.

## llm products defy easy measurement

three patterns.

rag chatbot for internal docs. users need correct, grounded answers. no hallucinations. enough context to trust. no single ground truth wording.

code-review assistant. fewer targeted changes. catches race conditions. says "good as-is" when right. token overlap with reference? meaningless.

support triage. routes right queue. de-escalates. never mislabels legal complaints. error costs vary wildly.

quality here is multi-dimensional. tied to human judgment. not a scalar bleu can fake.

teams end up with dashboards that do not match their gut on samples. metrics answer the wrong question.

## llm-as-a-judge: the promise and quick cracks

natural fix: use a strong llm as proxy human rater.

feed prompt, answer, maybe reference. give eval prompt and rubric. get score. maybe explanation.

unlocks what presets cannot: logic, helpfulness, safety, faithfulness, reasoning quality, format.

first run on real data? magic. flags hallucinations. explains misleading bits. spots "correct but useless".

busy teams love it. tireless junior reviewer at api speed.

then cracks show.

## failure modes that kill trust

goodhart first. train against judge, model learns judge-pleasing tricks. verbose fluff. fake confidence. hides uncertainty. product worsens, metric climbs.

vague rubrics. "rate 1-10". chaos. high variance. drifts with model versions. confuses experiment compares.

judge bias. favors formal verbosity. misses domain facts. encodes training biases.

leakage. judge sees hidden metadata. penalizes user-ok answers. rewards weird conformity.

opacity. "score 0.83". no tags or reasons. hard to debug. communicate. prioritize.

llm judge without design is fancy bleu.

## custom metrics encode product judgment

shift: metrics are product decisions in text.

good ones start from user pain. break quality into failures. attach costs. explicit rubrics. living artifacts.

metric prompt is spec. "10 if fully correct and grounded". "0 if fabricates". explain violations.

version them. changelog. review.

## real engineering cases

rag compliance q&a.

matters: no hallucinated rules. quotes right policy. conservative on uncertainty.

judge reads question, answer, retrieved policy. scores faithfulness, fabrication, alignment. tags safe/unsafe.

code gen assistant.

functional ok. project style. maintainable. no sec bugs.

judge sees code, diff, tests. simulates senior reviewer.

support bot.

resolves alone. escalates with context. no wrong promises. de-escalates.

labels convos. maps to real kpis: resolution time, refunds, nps.

## gaps begging for fixes

tooling buckets:

preset bundles. easy. rarely aligned.

raw judge wrappers. powerful. bad at versioning, combining, structure.

platforms. scalars per run. weak on failures, ci, drift.

missing:

metrics as versioned objects. names, owners, rubrics.

playgrounds to tweak rubrics. spot disagreements.

composability. faithfulness + helpfulness = product rating.

meta-eval. judge vs human correlation.

opportunity: better ways to express "good". connect to model behavior.

## metrics as judgment apis

dataset: reality sample.  
llm: hypothesis.  
metric: team judgment interface.

vague metric = bad api. brittle = coupled api. good = documented, stable.

llm executes spec. spec is asset.

## build rules from scars

principles.

start real failures. not synthetics.

name failures: halluc, verbose, under-explain.

rubric explicit. top/mid/zero cases. examples.

metrics as code. git. reviews.

validate vs humans. spot disagrees.

multi-scores. decide balances.

## metrics that drive products

preset metrics fake science. avoid hard questions: what is good here?

custom forces it. tolerable mistakes? style? risk level?

encode that. experiments match gut. team aligns. "improved?" means something.

## your turn

next feature live. skip rouge comfort.

ask: success feel? failure nightmares? test criteria? judge needs?

tools evolve. leverage is encoded judgment.

llm can judge. values come from you.
