# CineRank roadmap

Status values: `not_started` | `in_progress` | `done` | `blocked`.

Acceptance criteria are the definition of done for that task only.

---

## Phase 0 — Repository audit and project specification

**Objective:** Understand the real project and create a roadmap matched to the repository.

| ID | Task | Status | Acceptance criteria |
|----|------|--------|---------------------|
| 0.1 | Inspect architecture, recs, IDs, checks, deploy, debt | done | Written assessment matches code, not README claims |
| 0.2 | Create PROJECT_SPEC, ROADMAP, PROGRESS, initial ADR | done | Docs exist under `docs/` and distinguish implemented vs planned |
| 0.3 | Identify smallest next implementation task | done | Next task is a single Phase 1 slice with clear checks |

---

## Phase 1 — Reproducible development and baseline checks

**Objective:** Make the existing application reproducible before expanding it.

Do not add Redis or workers in this phase.

| ID | Task | Status | Acceptance criteria |
|----|------|--------|---------------------|
| 1.1 | Document and validate configuration; ignore secrets and generated files | not_started | `.env.example` lists required vars; committed secrets audit (SECRET_KEY/DEBUG) documented or moved to env without breaking local start; gitignore covers `.env`, venv, node_modules, build artifacts, local DB files; README startup still accurate |
| 1.2 | Establish dependency locking and repeatable local startup | not_started | Backend pins remain complete and installable from `requirements.txt` (or a chosen lock workflow); frontend lockfile used; documented commands start API and UI on a clean machine checklist |
| 1.3 | Add Docker Compose **only if** it clearly improves local Postgres/app startup | not_started | Optional: `docker compose` brings up Postgres (and later documented services) with a documented override for native Homebrew; app still runnable without Compose if Compose is skipped |
| 1.4 | Focused regression checks: auth, rating ownership, current recommender | not_started | Tests prove: unauthenticated ratings/recs rejected; user A cannot read/write user B’s ratings; score bounds; CF returns documented `method` keys on a tiny fixture; movies tests still pass |
| 1.5 | Add CI for the established checks | not_started | GitHub Actions (or existing CI) runs backend tests on PR; Postgres service or documented test settings; no secrets in logs |

---

## Phase 2 — Catalog, ratings, and watchlist foundation

**Objective:** Dependable application data for recommendation work.

Preserve current movie endpoint compatibility or document a deliberate migration.

| ID | Task | Status | Acceptance criteria |
|----|------|--------|---------------------|
| 2.1 | Canonical movie records with TMDB (and later MovieLens) ID mappings | not_started | Unique TMDB id; additive table; existing `Rating.movie_id` remains valid or is migrated with a recorded mapping |
| 2.2 | Rating uniqueness and validity constraints | not_started | DB-level unique (user, movie) and score range; existing rows remain intact |
| 2.3 | Persistent per-user watchlist | not_started | Authenticated CRUD; user A cannot access user B’s list; document localStorage transition |
| 2.4 | Repeatable, resumable catalog ingestion with bounded retries | not_started | Re-run does not duplicate movies; failures retry within a bound; source metadata recorded |
| 2.5 | Background processing only where ingestion requires it | not_started | Redis/Celery introduced only with a job that needs them; HTTP path still works if workers are down (documented) |
| 2.6 | Deleted, unavailable, and unmapped movie behavior | not_started | Documented eligibility rules; APIs do not leak other users’ data for missing titles |

---

## Phase 3 — Offline datasets and evaluation contract

**Objective:** Infrastructure that decides whether later models improve recommendations.

| ID | Task | Status | Acceptance criteria |
|----|------|--------|---------------------|
| 3.1 | Reproducible MovieLens acquisition/import with checksums | not_started | Documented source, version, checksum; import is resumable; artifacts not committed as huge binaries |
| 3.2 | Separate benchmark identities from application accounts | not_started | Eval users are not Django login users unless explicitly mapped |
| 3.3 | Chronological train / validation / test snapshots | not_started | Same config + seed + dataset version reproduces the same splits |
| 3.4 | Eligible movies, labels, repeated ratings, cold-start cohorts | not_started | Protocol written; unknown IDs handled explicitly |
| 3.5 | Independently checked Recall@K and NDCG@K | not_started | Hand-checkable toy examples pass; no leakage from future history |
| 3.6 | Baseline evaluation command + machine-readable manifest | not_started | CLI runs without HTTP server; manifest records seed, git revision, dataset version |

---

## Phase 4 — Collaborative and content baselines

**Objective:** Strong reference models before neural retrieval.

| ID | Task | Status | Acceptance criteria |
|----|------|--------|---------------------|
| 4.1 | Shared fit / score / recommend interfaces with batch support | not_started | Package usable from eval CLI; HTTP adapter optional |
| 4.2 | Training-only popularity baseline | not_started | Popularity fit on train only |
| 4.3 | Adapt existing user-based CF to the eval interface | not_started | Same protocol as other models; dense in-request code not the eval path |
| 4.4 | Sparse item–item CF | not_started | Sparse matrices; unobserved ≠ dislike |
| 4.5 | Regularized MF or BPR as a **separate** task | not_started | Own commit; compared under the same protocol |
| 4.6 | Simple metadata content baseline | not_started | Cold-item behavior documented |
| 4.7 | Reproducible comparison report | not_started | `docs/experiments/` report; no invented lifts |

---

## Phase 5 — Semantic search and vector retrieval

| ID | Task | Status | Acceptance criteria |
|----|------|--------|---------------------|
| 5.1 | Versioned text construction from permitted metadata | not_started | Encoder version, dim, normalization recorded |
| 5.2 | Resumable embedding generation and persistence | not_started | Missing descriptions handled; no mixed incompatible vectors |
| 5.3 | Exact pgvector retrieval as correctness reference | not_started | Exact search results are the reference |
| 5.4 | Semantic search endpoint and focused UI | not_started | End-to-end descriptive query works |
| 5.5 | HNSW vs exact, including filtered queries | not_started | ANN recall measured separately from rec relevance |
| 5.6 | Favorite-movie / genre onboarding content fallback | not_started | Cold users get a documented content path |

---

## Phase 6 — Interaction logging and frontend evolution

| ID | Task | Status | Acceptance criteria |
|----|------|--------|---------------------|
| 6.1 | Versioned event schemas and validation | not_started | Invalid events rejected |
| 6.2 | Idempotent event ingestion | not_started | Retry with same event id does not duplicate |
| 6.3 | Recommendation request ids and model versions in responses | not_started | Provenance fields present |
| 6.4 | Impressions vs API responses | not_started | Displayed items logged separately |
| 6.5 | Click, watchlist, rating, dismissal linkage | not_started | Client cannot spoof another user’s id |
| 6.6 | Gradual TypeScript + TanStack Query on touched modules | not_started | Touched surfaces typed; no big-bang rewrite |

---

## Phase 7 — Hybrid two-tower retrieval

| ID | Task | Status | Acceptance criteria |
|----|------|--------|---------------------|
| 7.1 | Training examples and negative sampling with leakage checks | not_started | Histories as of cutoff; known positives excluded from negatives |
| 7.2 | Small PyTorch user and movie encoders | not_started | Trainable locally; documented size |
| 7.3 | First model vs Phase 4 | not_started | Report; **no improvement claim if it loses** |
| 7.4 | Compatible encoder and movie-vector artifacts | not_started | Version-compatible export |
| 7.5 | Retrieval adapter behind existing recommend interface | not_started | Prior recommender remains fallback |
| 7.6 | Merge/dedupe neural, content, popularity candidates | not_started | Deterministic merge rules |
| 7.7 | Content-only / CF-only / hybrid ablations | not_started | Same protocol; serving cost noted qualitatively or measured |

---

## Phase 8 — Learning-to-rank

| ID | Task | Status | Acceptance criteria |
|----|------|--------|---------------------|
| 8.1 | Shared feature schema offline and online | not_started | Controlled examples match |
| 8.2 | Weighted-score ranker reference | not_started | Configuration switchable |
| 8.3 | Ranking examples from earlier-fitted retriever | not_started | Chronological separation of stages |
| 8.4 | LightGBM LambdaRank with query groups | not_started | Groups and labels explicit |
| 8.5 | Integrate behind a configuration switch | not_started | Fallback if artifact missing |
| 8.6 | Compare vs reference; inspect feature contributions | not_started | Documented limitations of labels |

---

## Phase 9 — Diversity and evidence-based explanations

| ID | Task | Status | Acceptance criteria |
|----|------|--------|---------------------|
| 9.1 | Deterministic relevance/diversity reranking | not_started | Empty/small candidate sets handled |
| 9.2 | Coverage and intra-list diversity metrics | not_started | Metrics on eval lists |
| 9.3 | Relevance/diversity trade-off eval | not_started | Curve or table in `docs/experiments/` |
| 9.4 | Bounded user-facing diversity control | not_started | Setting recorded with the request |
| 9.5 | Explanations from actual retrieval sources/features | not_started | No causal claims beyond descriptive evidence |

---

## Phase 10 — Model lifecycle and serving reliability

| ID | Task | Status | Acceptance criteria |
|----|------|--------|---------------------|
| 10.1 | MLflow or existing tracking | not_started | Runs recorded when volume justifies it |
| 10.2 | Immutable artifact manifests and compatibility checks | not_started | Incomplete bundles rejected |
| 10.3 | Atomic bundle activation and rollback | not_started | Rollback demonstrated |
| 10.4 | Version-aware recommendation caching | not_started | Auth not bypassed by cache |
| 10.5 | Timeouts and fallback | not_started | Prior model or popularity fallback |
| 10.6 | Structured logs, tracing, documented Locust workload | not_started | Workload specified; no invented latency SLOs |

---

## Phase 11 — Cloud deployment and operations

Do not provision paid infrastructure, expose public services, or change production data without explicit authorization.

| ID | Task | Status | Acceptance criteria |
|----|------|--------|---------------------|
| 11.1 | ADR: topology, Lambda retain/retire, expected cost | not_started | Written decision |
| 11.2 | Terraform for the selected environment | not_started | Plan-only until authorized to apply |
| 11.3 | Frontend + app with managed config/secrets | not_started | Documented release |
| 11.4 | Workers, migrations, release process | not_started | Documented |
| 11.5 | Health checks, backups, runbooks | not_started | Restore steps written |
| 11.6 | Deploy and restore/rollback checks | not_started | Performed only with authorization |

Proposed later direction (not implemented): S3/CloudFront, ECS Fargate, RDS, managed Redis.

---

## Phase 12 — Sequential recommendation (research extension)

Keep experimental until results justify serving.

| ID | Task | Status | Acceptance criteria |
|----|------|--------|---------------------|
| 12.1 | Recency-weighted history pooling | not_started | No future items in history |
| 12.2 | Small SASRec-style causal self-attention | not_started | Masking tests |
| 12.3 | Padding, masking, sequence-construction checks | not_started | Unit tests on sequences |
| 12.4 | Ordered vs shuffled-history conditions | not_started | Same protocol |
| 12.5 | Compare vs equally tuned simpler models | not_started | Tuning budget documented |
| 12.6 | Multi-seed report with uncertainty | not_started | Ratings timestamps **not** treated as verified watch order |

---

## Follow-ups discovered in Phase 0 (not blocking 1.1)

- Unused `djangorestframework_simplejwt` / `PyJWT` unless JWT is chosen later.
- Unused `User` import in `recommendations/views.py`.
- `watchlist` installed but has no URLs or models.
- Dense CF on all ratings will not scale; acceptable until Phase 4 eval path exists.
- Hardcoded Lambda hostname in `ALLOWED_HOSTS`.
