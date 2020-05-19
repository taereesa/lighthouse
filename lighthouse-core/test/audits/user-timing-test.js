/**
 * @license Copyright 2016 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const UserTimingsAudit = require('../../audits/user-timings.js');
const assert = require('assert').strict;
const traceEvents = require('../fixtures/traces/trace-user-timings.json');

function generateArtifactsWithTrace(trace) {
  return {
    traces: {
      defaultPass: {traceEvents: Array.isArray(trace) ? trace : trace.traceEvents},
    },
  };
}

/* eslint-env jest */
describe('Performance: user-timings audit', () => {
  it('evaluates valid input correctly', () => {
    const artifacts = generateArtifactsWithTrace(traceEvents);
    return UserTimingsAudit.audit(artifacts, {computedCache: new Map()}).then(auditResult => {
      assert.equal(auditResult.score, 0);
      expect(auditResult.displayValue).toBeDisplayString('2 user timings');

      assert.equal(auditResult.details.items[0].name, 'measure_test');
      assert.equal(auditResult.details.items[0].timingType, 'Measure');
      assert.equal(auditResult.details.items[0].startTime, 0.002);
      assert.equal(auditResult.details.items[0].duration, 1000.965);

      assert.equal(auditResult.details.items[1].name, 'mark_test');
      assert.equal(auditResult.details.items[1].timingType, 'Mark');
      assert.equal(auditResult.details.items[1].startTime, 1000.954);
      assert.equal(auditResult.details.items[1].duration, undefined);
    });
  });
});
