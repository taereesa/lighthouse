/**
 * @license Copyright 2020 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

/* eslint-env jest */

const fs = require('fs');
const DuplicatedJavascript = require('../../../audits/byte-efficiency/duplicated-javascript.js');
const trace = require('../../fixtures/traces/lcp-m78.json');
const devtoolsLog = require('../../fixtures/traces/lcp-m78.devtools.log.json');

function load(name) {
  const mapJson = fs.readFileSync(
    `${__dirname}/../../fixtures/source-maps/${name}.js.map`,
    'utf-8'
  );
  const content = fs.readFileSync(`${__dirname}/../../fixtures/source-maps/${name}.js`, 'utf-8');
  return {map: JSON.parse(mapJson), content};
}

describe('DuplicatedJavascript computed artifact', () => {
  it('works (simple)', async () => {
    const context = {computedCache: new Map(), options: {ignoreThresholdInBytes: 500}};
    const {map, content} = load('foo.min');
    const artifacts = {
      URL: {finalUrl: 'https://example.com'},
      SourceMaps: [
        {scriptUrl: 'https://example.com/foo1.min.js', map},
        {scriptUrl: 'https://example.com/foo2.min.js', map},
      ],
      ScriptElements: [
        {src: 'https://example.com/foo1.min.js', content},
        {src: 'https://example.com/foo2.min.js', content},
      ],
    };
    const networkRecords = [{url: 'https://example.com', resourceType: 'Document'}];
    const results = await DuplicatedJavascript.audit_(artifacts, networkRecords, context);
    expect({items: results.items, wastedBytesByUrl: results.wastedBytesByUrl})
      .toMatchInlineSnapshot(`
      Object {
        "items": Array [
          Object {
            "source": "Other",
            "subItems": Object {
              "items": Array [
                Object {
                  "url": "https://example.com/foo1.min.js",
                },
                Object {
                  "url": "https://example.com/foo2.min.js",
                },
              ],
              "type": "subitems",
            },
            "totalBytes": 0,
            "url": "",
            "wastedBytes": 682,
          },
        ],
        "wastedBytesByUrl": Map {
          "https://example.com/foo2.min.js" => 682,
        },
      }
    `);
  });

  it('works (complex)', async () => {
    const context = {computedCache: new Map()};
    const bundleData1 = load('coursehero-bundle-1');
    const bundleData2 = load('coursehero-bundle-2');
    const artifacts = {
      URL: {finalUrl: 'https://example.com'},
      SourceMaps: [
        {scriptUrl: 'https://example.com/coursehero-bundle-1.js', map: bundleData1.map},
        {scriptUrl: 'https://example.com/coursehero-bundle-2.js', map: bundleData2.map},
      ],
      ScriptElements: [
        {src: 'https://example.com/coursehero-bundle-1.js', content: bundleData1.content},
        {src: 'https://example.com/coursehero-bundle-2.js', content: bundleData2.content},
      ],
    };
    const networkRecords = [{url: 'https://example.com', resourceType: 'Document'}];
    const results = await DuplicatedJavascript.audit_(artifacts, networkRecords, context);
    expect({items: results.items, wastedBytesByUrl: results.wastedBytesByUrl})
      .toMatchInlineSnapshot(`
      Object {
        "items": Array [
          Object {
            "source": "Control/assets/js/vendor/ng/select/select.js",
            "subItems": Object {
              "items": Array [
                Object {
                  "sourceBytes": 48513,
                  "url": "https://example.com/coursehero-bundle-1.js",
                },
                Object {
                  "sourceBytes": 48513,
                  "url": "https://example.com/coursehero-bundle-2.js",
                },
              ],
              "type": "subitems",
            },
            "totalBytes": 0,
            "url": "",
            "wastedBytes": 48513,
          },
          Object {
            "source": "Control/assets/js/vendor/ng/select/angular-sanitize.js",
            "subItems": Object {
              "items": Array [
                Object {
                  "sourceBytes": 9135,
                  "url": "https://example.com/coursehero-bundle-1.js",
                },
                Object {
                  "sourceBytes": 9135,
                  "url": "https://example.com/coursehero-bundle-2.js",
                },
              ],
              "type": "subitems",
            },
            "totalBytes": 0,
            "url": "",
            "wastedBytes": 9135,
          },
          Object {
            "source": "node_modules/@babel/runtime",
            "subItems": Object {
              "items": Array [
                Object {
                  "sourceBytes": 5467,
                  "url": "https://example.com/coursehero-bundle-1.js",
                },
                Object {
                  "sourceBytes": 4410,
                  "url": "https://example.com/coursehero-bundle-2.js",
                },
              ],
              "type": "subitems",
            },
            "totalBytes": 0,
            "url": "",
            "wastedBytes": 4410,
          },
          Object {
            "source": "js/src/utils/service/amplitude-service.ts",
            "subItems": Object {
              "items": Array [
                Object {
                  "sourceBytes": 1348,
                  "url": "https://example.com/coursehero-bundle-1.js",
                },
                Object {
                  "sourceBytes": 1325,
                  "url": "https://example.com/coursehero-bundle-2.js",
                },
              ],
              "type": "subitems",
            },
            "totalBytes": 0,
            "url": "",
            "wastedBytes": 1325,
          },
          Object {
            "source": "js/src/search/results/store/filter-store.ts",
            "subItems": Object {
              "items": Array [
                Object {
                  "sourceBytes": 12717,
                  "url": "https://example.com/coursehero-bundle-1.js",
                },
                Object {
                  "sourceBytes": 12650,
                  "url": "https://example.com/coursehero-bundle-2.js",
                },
              ],
              "type": "subitems",
            },
            "totalBytes": 0,
            "url": "",
            "wastedBytes": 12650,
          },
          Object {
            "source": "js/src/search/results/view/filter/autocomplete-list.tsx",
            "subItems": Object {
              "items": Array [
                Object {
                  "sourceBytes": 1143,
                  "url": "https://example.com/coursehero-bundle-2.js",
                },
                Object {
                  "sourceBytes": 1134,
                  "url": "https://example.com/coursehero-bundle-1.js",
                },
              ],
              "type": "subitems",
            },
            "totalBytes": 0,
            "url": "",
            "wastedBytes": 1134,
          },
          Object {
            "source": "js/src/search/results/view/filter/autocomplete-filter.tsx",
            "subItems": Object {
              "items": Array [
                Object {
                  "sourceBytes": 3823,
                  "url": "https://example.com/coursehero-bundle-1.js",
                },
                Object {
                  "sourceBytes": 3812,
                  "url": "https://example.com/coursehero-bundle-2.js",
                },
              ],
              "type": "subitems",
            },
            "totalBytes": 0,
            "url": "",
            "wastedBytes": 3812,
          },
          Object {
            "source": "js/src/search/results/view/filter/autocomplete-filter-with-icon.tsx",
            "subItems": Object {
              "items": Array [
                Object {
                  "sourceBytes": 2696,
                  "url": "https://example.com/coursehero-bundle-1.js",
                },
                Object {
                  "sourceBytes": 2693,
                  "url": "https://example.com/coursehero-bundle-2.js",
                },
              ],
              "type": "subitems",
            },
            "totalBytes": 0,
            "url": "",
            "wastedBytes": 2693,
          },
          Object {
            "source": "js/src/common/component/school-search.tsx",
            "subItems": Object {
              "items": Array [
                Object {
                  "sourceBytes": 5840,
                  "url": "https://example.com/coursehero-bundle-2.js",
                },
                Object {
                  "sourceBytes": 5316,
                  "url": "https://example.com/coursehero-bundle-1.js",
                },
              ],
              "type": "subitems",
            },
            "totalBytes": 0,
            "url": "",
            "wastedBytes": 5316,
          },
          Object {
            "source": "js/src/common/component/search/abstract-taxonomy-search.tsx",
            "subItems": Object {
              "items": Array [
                Object {
                  "sourceBytes": 3103,
                  "url": "https://example.com/coursehero-bundle-1.js",
                },
                Object {
                  "sourceBytes": 3098,
                  "url": "https://example.com/coursehero-bundle-2.js",
                },
              ],
              "type": "subitems",
            },
            "totalBytes": 0,
            "url": "",
            "wastedBytes": 3098,
          },
          Object {
            "source": "node_modules/lodash-es",
            "subItems": Object {
              "items": Array [
                Object {
                  "sourceBytes": 1751,
                  "url": "https://example.com/coursehero-bundle-2.js",
                },
                Object {
                  "sourceBytes": 1708,
                  "url": "https://example.com/coursehero-bundle-1.js",
                },
              ],
              "type": "subitems",
            },
            "totalBytes": 0,
            "url": "",
            "wastedBytes": 1708,
          },
          Object {
            "source": "Other",
            "subItems": Object {
              "items": Array [
                Object {
                  "url": "https://example.com/coursehero-bundle-1.js",
                },
                Object {
                  "url": "https://example.com/coursehero-bundle-2.js",
                },
              ],
              "type": "subitems",
            },
            "totalBytes": 0,
            "url": "",
            "wastedBytes": 4460,
          },
        ],
        "wastedBytesByUrl": Map {
          "https://example.com/coursehero-bundle-2.js" => 88606,
          "https://example.com/coursehero-bundle-1.js" => 9648,
        },
      }
    `);
  });

  it('.audit', async () => {
    // Use a real trace fixture, but the bundle stuff.
    const bundleData1 = load('coursehero-bundle-1');
    const bundleData2 = load('coursehero-bundle-2');
    const artifacts = {
      URL: {finalUrl: 'https://www.paulirish.com'},
      devtoolsLogs: {
        [DuplicatedJavascript.DEFAULT_PASS]: devtoolsLog,
      },
      traces: {
        [DuplicatedJavascript.DEFAULT_PASS]: trace,
      },
      SourceMaps: [
        {
          scriptUrl: 'https://www.paulirish.com/javascripts/firebase-performance.js',
          map: bundleData1.map,
        },
        {
          scriptUrl: 'https://www.paulirish.com/javascripts/firebase-app.js',
          map: bundleData2.map,
        },
      ],
      ScriptElements: [
        {
          src: 'https://www.paulirish.com/javascripts/firebase-performance.js',
          content: bundleData1.content,
        },
        {
          src: 'https://www.paulirish.com/javascripts/firebase-app.js',
          content: bundleData2.content,
        },
      ],
    };

    const ultraSlowThrottling = {rttMs: 150, throughputKbps: 100, cpuSlowdownMultiplier: 8};
    const settings = {throttlingMethod: 'simulate', throttling: ultraSlowThrottling};
    const context = {settings, computedCache: new Map()};
    const results = await DuplicatedJavascript.audit(artifacts, context);

    // Without the `wastedBytesByUrl` this would be zero because the items don't define a url.
    expect(results.details.overallSavingsMs).toBe(300);
  });

  it('_getNodeModuleName', () => {
    const testCases = [
      ['node_modules/package/othermodule.js', 'package'],
      ['node_modules/somemodule/node_modules/package/othermodule.js', 'package'],
      [
        'node_modules/somemodule/node_modules/somemodule2/node_modules/somemodule2/othermodule.js',
        'somemodule2',
      ],
      ['node_modules/@lh/ci', '@lh/ci'],
      ['node_modules/blahblah/node_modules/@lh/ci', '@lh/ci'],
    ];
    for (const [input, expected] of testCases) {
      expect(DuplicatedJavascript._getNodeModuleName(input)).toBe(expected);
    }
  });
});
