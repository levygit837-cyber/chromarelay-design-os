# ChromaRelay Design Operations

ChromaRelay coordinates creative design work across specialized agents while protecting project truth, context boundaries, and evidence-backed decisions.

## Language

**Design Work**:
A bounded request to create, document, redesign, explore, or refine a visual product or system.
_Avoid_: Job, generic task

**Workflow**:
A reusable state machine that defines the phases required for a class of Design Work.
_Avoid_: Pipeline when referring to the reusable definition

**Run**:
One execution of a Workflow against a specific objective and scope.
_Avoid_: Session, job

**Run Contract**:
The authoritative record of a Run's objective, scope, Workflow, autonomy, active phase, constraints, outputs, and transition policy.
_Avoid_: Plan, prompt

**Phase**:
One bounded stage of a Workflow with a purpose, responsible Role, input contract, output contract, and exit policy.
_Avoid_: Step when referring to a state-machine stage

**Phase Packet**:
The minimum context compiled for one Role to execute one Phase without receiving the entire project or Run history.
_Avoid_: Mega-prompt, context dump

**Role**:
A responsibility contract defining what an agent may decide, read, write, spawn, and return.
_Avoid_: Persona

**Skill**:
An advisory capability pack containing process or craft guidance that a Role may load on demand.
_Avoid_: Source of truth

**Skill Kit**:
A bounded set containing one primary Skill and optional narrow supporting references for a Phase.
_Avoid_: Skill bundle when it implies loading every available Skill

**Artifact**:
A versioned output produced or consumed by a Run, with provenance and status.
_Avoid_: File when discussing its design-operations meaning

**Canonical Artifact**:
An approved Artifact promoted into project truth.
_Avoid_: Latest file

**Handoff**:
A structured specialist result containing claims, evidence, produced Artifacts, decisions, risks, confidence, and requested transition.
_Avoid_: Final message

**Decision**:
A recorded choice with rationale, alternatives, evidence, scope, and status.
_Avoid_: Preference

**Lock**:
An accepted Decision that cannot be silently changed by a lower-authority Phase or Skill.
_Avoid_: Immutable rule

**Evidence**:
A reproducible observation supporting a claim, including screenshots, code locations, test output, measurements, or comparison results.
_Avoid_: Opinion

**Gate**:
A declared check with inputs, method, pass policy, and evidence output. Gates may be deterministic or qualitative.
_Avoid_: Vague review

**Direction**:
A coherent creative thesis covering composition, typography, color, surfaces, motion, signature, and system potential.
_Avoid_: Theme, style variant

**Surface**:
A user-visible design unit such as a page, flow, component family, or application shell.
_Avoid_: Screen when the scope is broader than one viewport

**Baseline**:
A frozen representation of the current state used for comparison and regression analysis.
_Avoid_: Old version

**Promotion**:
The controlled transition of approved Run Artifacts and Decisions into canonical project state.
_Avoid_: Copying files

**Project Overlay**:
The portable ChromaRelay files installed into a target repository without taking ownership of that repository's application architecture.
_Avoid_: Fork

**Adapter**:
A concrete integration satisfying a ChromaRelay interface at a seam, such as the OMP adapter or a filesystem workspace.
_Avoid_: Integration layer
