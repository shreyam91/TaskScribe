import {
  computeNextTriggerAt,
  transitionsAfterTrigger,
  type ReminderLike,
} from '../lib/reminder-recurrence.ts';
import moment from 'moment-timezone';

const TZ = 'America/New_York';
let failures = 0;

function check(desc: string, got: Date | null, expected: string | null) {
  let ok;
  if (expected === null) {
    ok = got === null;
  } else {
    ok = got !== null && moment(got).tz(TZ).format('YYYY-MM-DD HH:mm') === expected;
  }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${desc}: ${got ? moment(got).tz(TZ).format('YYYY-MM-DD HH:mm') : 'null'}  (expected ${expected ?? 'null'})`);
  if (!ok) failures++;
}

function totalDesc(desc: string, got: Date | null, expectedTotal: string | null) {
  const ok = got?.toISOString() ?? null === expectedTotal;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${desc}: ${got?.toISOString() ?? 'null'}  (expected ${expectedTotal ?? 'null'})`);
  if (!ok) failures++;
}

// Fixed reference: 2026-09-16 is a Wednesday in America/New_York.
const ref = moment.tz('2026-09-16 09:00', TZ).toDate(); // Wed 9am EDT
const refFriday = moment.tz('2026-09-18 09:00', TZ).toDate(); // Fri 9am
const refSaturday = moment.tz('2026-09-19 09:00', TZ).toDate(); // Sat 9am
const refSunday = moment.tz('2026-09-20 09:00', TZ).toDate(); // Sun 9am

console.log('--- one-time reminders never advance ---');
check('one_time -> null', computeNextTriggerAt('one_time', 'daily', ref, TZ), null);

console.log('\n--- daily ---');
check('daily +1 day', computeNextTriggerAt('recurring', 'daily', ref, TZ), '2026-09-17 09:00');

console.log('\n--- weekly ---');
check('weekly +7 days', computeNextTriggerAt('recurring', 'weekly', ref, TZ), '2026-09-23 09:00');

console.log('\n--- weekdays ---');
check('Wed -> Thu', computeNextTriggerAt('recurring', 'weekdays', ref, TZ), '2026-09-17 09:00');
check('Fri -> Mon', computeNextTriggerAt('recurring', 'weekdays', refFriday, TZ), '2026-09-21 09:00');
check('Sat -> Mon', computeNextTriggerAt('recurring', 'weekdays', refSaturday, TZ), '2026-09-21 09:00');
check('Sun -> Mon', computeNextTriggerAt('recurring', 'weekdays', refSunday, TZ), '2026-09-21 09:00');

console.log('\n--- custom (every N days) ---');
check('every 3 days', computeNextTriggerAt('recurring', '3', ref, TZ), '2026-09-19 09:00');

console.log('\n--- DST safety (America/New_York spring forward 2026-03-08) ---');
const beforeDST = moment.tz('2026-03-07 09:00', TZ).toDate(); // Sat
const afterDST = computeNextTriggerAt('recurring', 'daily', beforeDST, TZ)!;
console.log(
  `${moment(afterDST).tz(TZ).hour() === 9 ? 'PASS' : 'FAIL'}  daily across DST keeps 09:00 local (dst-safe): ${moment(afterDST).tz(TZ).format('YYYY-MM-DD HH:mm z')}`
);
if (moment(afterDST).tz(TZ).hour() !== 9) failures++;

console.log('\n--- transitionsAfterTrigger ---');
const recurring: ReminderLike = {
  trigger_type: 'recurring',
  recurrence_pattern: 'daily',
  next_trigger_at: ref,
};
const rt = transitionsAfterTrigger(recurring, TZ);
totalDesc('recurring stays active', rt.next_trigger_at, computeNextTriggerAt('recurring', 'daily', ref, TZ)!.toISOString());
console.log(`${rt.state === 'active' && rt.is_enabled ? 'PASS' : 'FAIL'}  recurring -> state active, enabled`);
if (!(rt.state === 'active' && rt.is_enabled)) failures++;

const oneTime: ReminderLike = { trigger_type: 'one_time', recurrence_pattern: null, next_trigger_at: ref };
const ot = transitionsAfterTrigger(oneTime, TZ);
totalDesc('one_time -> null next', ot.next_trigger_at, null);
console.log(`${ot.state === 'completed' && !ot.is_enabled && ot.next_trigger_at === null ? 'PASS' : 'FAIL'}  one_time -> completed, disabled`);
if (!(ot.state === 'completed' && !ot.is_enabled && ot.next_trigger_at === null)) failures++;

console.log('\n' + (failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`));
process.exit(failures === 0 ? 0 : 1);