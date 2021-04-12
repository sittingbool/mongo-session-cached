# TODO

## time values: 

expiration date
max session lifetime : seconds tha a session lives
sync interval -> when this threshold is reached will check for sessions that are over lifetime and delete them, if session have additional extension, session will also be stored
last sny : store when the last check for expiration and removal was performed

- on every action (using a threshold) check if sessions are outdated and remove them

- session will be created in mongodb, once logged in
- session can be expended (only on local store) -< expansion will be evaluated before removal and expiration persisted when necessary
- logout removes session from cache and persistance
- updating a user can update all his session.
- sessions for a user can all be removed

## Future features:

- add hazelcast in memory db access
