# Use one deep core package

Createive uses one core TypeScript module with a small Design Manager interface rather than many shallow packages. Routing, transitions, context compilation, authority and persistence stay behind that interface; filesystem and memory are adapters at a real Workspace seam.