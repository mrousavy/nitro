# Release performance CI

`Nitro Performance` builds the example's benchmark-only Release/Hermes variant,
then runs base → head → head → base on one booted target. A noisy comparison can
run one additional head/base pair. Each suite measures 40 cases with five warmup
batches and twenty samples, calibrated toward 150 ms per batch.

## Android host requirements

The API 36 x86_64 emulator **must use KVM CPU acceleration**. The workflow grants
the ephemeral runner access to `/dev/kvm`, verifies acceleration before boot, and
launches with `-accel on`. Missing acceleration fails the job rather than silently
falling back to software CPU emulation. Software GPU rendering is separate and is
still used on the headless runner.

The initial bootstrap run accidentally used `-accel off`: boot alone took 8½
minutes and six suites took another 32½ minutes. Those Android timings are not a
performance baseline. Accelerated results use a distinct `...-kvm` Bencher testbed.

Host-side log lines show each suite's start, completion, measurement duration,
total wall time (including app installation/launch), and why a repeat pair ran.
These logs are outside the app's timed regions. Raw JSON, BMF, and comparison
Markdown are retained in the workflow artifacts for 30 days.

The Bencher reporter only becomes active once its `workflow_run` definition is on
the default branch. It posts the rebuilt paired-comparison table as one updatable
PR comment, independently of Bencher's historical comparison. Stale results do
not overwrite a newer PR revision, and user-authored comments are never edited.
Revoke the previously exposed credential and replace the
repository's `BENCHER_KEY` secret before enabling publishing. PR jobs never receive
that secret. After rotation, set the repository variable `NITRO_BENCHER_ENABLED`
to `true` to enable Bencher uploads. The paired PR comment does not need that key.
Verdicts remain advisory during noise calibration.

## Promoting performance verdicts to a gate

This initial workflow always passes `--mode advisory`; merging it does **not**
enable performance enforcement. Collect at least 30 successful main/no-change
runs on each unchanged suite and testbed before a separate reviewed promotion.
Use only same-commit comparisons to estimate noise; ordinary base/head deltas
may include real code changes and must not inflate the noise allowance.

For each synchronous case, the promotion must set a per-case budget of
`max(5%, 1.5 × p95(abs(no-change delta)))`. Cases requiring over 10%, Promise
metrics, and inconclusive comparisons remain advisory. The current 5% table
threshold is provisional, not a calibrated gate. Do not simply change `--mode`
to `enforce`: the initial comparator uses that single provisional threshold, and
the trusted reporter deliberately rejects PR attempts to enable enforcement.
Promotion needs the reviewed per-case policy and matching reporter support.
