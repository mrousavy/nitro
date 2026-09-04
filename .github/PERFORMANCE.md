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
the default branch. Revoke the previously exposed credential and replace the
repository's `BENCHER_KEY` secret before enabling publishing. PR jobs never receive
that secret. Verdicts remain advisory during noise calibration.
