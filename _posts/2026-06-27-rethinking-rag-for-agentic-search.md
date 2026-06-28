---
layout: post
title: "rethinking rag for agentic search"
date: 2025-06-27
categories: meta
---

> why top-k retrieval is the wrong abstraction for agents

## modern rag has an architectural assumption

for years, rag has been built around a simple assumption.

modern llms can debug code, orchestrate tools, write production
software, reason over long execution traces, and iteratively refine
plans. yet whenever they need external knowledge, we still route them
through a single retrieval api.

``` python
results = retriever.search(query, top_k=10)
```

this looks harmless.

it is also the most opinionated interface in the entire stack.

the retriever decides what the llm is allowed to observe before
reasoning even begins.

that assumption made sense when retrieval was the strongest component in
the system.

today, reasoning is rapidly becoming the stronger component.

the architecture, however, has barely changed.

## why rag became the default

rag was never the goal.

it was an optimization.

engineering workspaces are huge. source code, design docs, runbooks,
wikis, slack discussions, postmortems and tickets cannot fit into an llm
context window.

retrieval solved this by aggressively reducing the search space.

    workspace

    |

    embedding

    |

    vector search

    |

    top k chunks

    |

    llm

for years this was exactly the right tradeoff.

reasoning was expensive.

context windows were small.

vector search was fast.

there was little reason to question the abstraction.

## retrieval is an api, not just an algorithm

thinking about retrieval as a model hides the more interesting
observation.

retrieval is an interface.

every interface determines what information is available to downstream
consumers.

the retrieval interface exposes exactly one capability.

given a query, return the best ranked chunks.

it does not expose uncertainty.

it does not expose alternative search paths.

it does not expose near misses.

it does not allow iterative narrowing before information is discarded.

that means the llm never reasons over the corpus.

it reasons over whatever survives retrieval.

this is an architectural constraint rather than a reasoning limitation.

## retrieval compresses information

modern rag pipelines repeatedly compress information.

workspace

-\> chunking

-\> embeddings

-\> nearest neighbour search

-\> top k

-\> llm

every stage removes information.

chunking removes surrounding context.

embeddings remove lexical precision.

ranking discards candidates.

top k discards everything else.

none of these choices are incorrect.

they are practical engineering optimizations.

but every optimization introduces an abstraction boundary.

## what changes for agentic systems

traditional rag assumes a linear execution model.

question

-\> retrieve

-\> reason

-\> answer

agents rarely operate this way.

they search.

inspect.

form hypotheses.

revise.

verify.

search again.

their execution resembles software debugging more than document
retrieval.

this is already visible in coding agents like claude code, codex, aider
and openhands.

they spend much of their execution inside terminal tools.

they search.

inspect.

trace.

repeat.

the search process itself becomes part of reasoning.

## who owns the search policy

this is the inversion proposed by the paper.

historically, the retriever owned the search policy.

the llm simply consumed whatever was returned.

direct corpus interaction flips that ownership.

the llm now owns the search policy.

terminal commands become primitive operations rather than complete
retrieval solutions.

rg.

grep.

find.

sed.

cat.

head.

tail.

individually they are extremely simple.

collectively they become building blocks for adaptive search.

## composability beats fixed retrieval

consider two interfaces.

    retrieve(query)

versus

    rg
    find
    grep
    sed
    cat
    python

the first exposes one operation.

the second exposes primitives.

this is reminiscent of the unix philosophy.

small deterministic tools.

simple interfaces.

arbitrary composition.

the intelligence does not live inside grep.

it emerges from how the llm composes these primitives.

an investigation might look like

rg "kv cache"

-\> discover paged attention

-\> inspect implementation

-\> discover continuous batching

-\> search again

notice something subtle.

none of these searches attempted to answer the original question.

each search attempted to discover the next search.

the search strategy is synthesized online.

## retrieval interface resolution

the deepest idea is retrieval interface resolution.

traditional retrieval exposes documents or chunks.

direct interaction exposes symbols, functions, lines, neighbouring
context and exact lexical matches.

resolution is about control rather than volume.

higher resolution allows an agent to progressively narrow its
investigation instead of repeatedly asking for another ranked list.

the abstraction becomes interactive rather than transactional.

## why this matters

the surprising result is not simply higher benchmark scores.

the interesting observation is that better performance often does not
come from surfacing more relevant documents.

it comes from extracting more value after reaching a relevant document.

once the agent reaches useful evidence it performs local exploration.

inspect.

extract entity.

search again.

verify.

continue.

that behaviour is difficult to express through a fixed retrieve api.

## where this breaks down

none of this means retrieval disappears.

search primitives optimise search depth.

retrievers optimise search breadth.

as corpora become extremely large, exhaustive terminal exploration
becomes expensive.

tool calls increase.

latency grows.

cost rises.

there is still a regime where retrieval remains the better engineering
tradeoff.

the point is not replacing retrieval.

the point is questioning whether top k retrieval should remain the only
interface between reasoning and information.

## takeaway

the contribution is bigger than replacing embeddings with grep.

it reframes retrieval as an interface design problem.

for years we pushed intelligence into retrievers.

agentic systems suggest pushing intelligence into orchestration instead.

once the llm becomes the strongest reasoning component in the stack,
perhaps it should own search as well.

Original Paper: [Beyond Semantic Similarity: Rethinking Retrieval for Agentic Search via Direct Corpus Interaction](https://arxiv.org/abs/2605.05242)
