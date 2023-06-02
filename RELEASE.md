# Release Guide

1. Update version field in `package.json`
1. Stage: `git add package.json`
1. Commit: `git commit -m vX.Y.Z`
1. Create tag: `git tag vX.Y.Z`
1. Push: `git push --atomic origin master vX.Y.Z`
