#!/bin/sh
# Losstaand achtergrondproces voor de dagelijkse conceptgenerator — draait
# bewust als apart proces i.p.v. via Next.js' instrumentation-hook (zelfde
# reden en aanpak als novapers.nl, zie scripts/dagelijkse-generator.mjs).
# Faalt dit om wat voor reden dan ook, dan mag dat de hoofdsite nooit
# platleggen — vandaar op de achtergrond, los van "exec" voor de
# hoofdserver hieronder.
#
# Een kale "&" alleen is niet genoeg: crasht het script, dan kijkt Docker's
# eigen restart-beleid alleen naar het HOOFDproces (server.js), niet naar
# dit losse achtergrondproces — de site zelf blijft dan gewoon werken,
# terwijl de dagelijkse generator stilletjes voor onbepaalde tijd stopt.
# Deze lus herstart het script automatisch (met een korte pauze, om geen
# crash-loop te veroorzaken bij een structureel probleem) zodra het
# onverwacht stopt.
set -e

(
  while true; do
    node scripts/dagelijkse-generator.mjs
    echo "[docker-entrypoint] dagelijkse-generator is gestopt (exit code $?) — herstart over 10s" >&2
    sleep 10
  done
) &

exec node server.js
