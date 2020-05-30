/**
 * @license Copyright 2020 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

/* eslint-disable no-console */

/**
 * @fileoverview - Used to generate size estimation data for polyfills in LegacyJavaScript audit.
 *
 * Returns a flattened graph of modules found in bundles used for an individual core-js polyfill.
 *
 * USAGE:
 *   1. Run `node run.js`
 *   2. Run `node create-polyfill-size-estimation.js`
 *   3. Inspect `polyfill-graph-data.json`
 */

const fs = require('fs');
const makeHash = require('./hash.js');
const LegacyJavascript = require('../../audits/byte-efficiency/legacy-javascript.js');
const JsBundles = require('../../computed/js-bundles.js');
const prettyJSONStringify = require('pretty-json-stringify');

const hash = makeHash();
const VARIANT_DIR = `${__dirname}/variants/${hash}`;
const OUTPUT_PATH = `${__dirname}/../../audits/byte-efficiency/polyfill-graph-data.json`;

/**
 * @param {number[]} arr
 */
function sum(arr) {
  return arr.reduce((acc, cur) => acc + cur, 0);
}

function getPolyfillDependencies() {
  /** @type {Map<string, string[]>} */
  const polyfillDependencies = new Map();

  for (const {name, coreJs3Module} of LegacyJavascript.getPolyfillData()) {
    const folder = coreJs3Module.replace(/[^a-zA-Z0-9]+/g, '-');
    const bundleMapPath =
      `${VARIANT_DIR}/core-js-3-only-polyfill/${folder}/main.bundle.min.js.map`;
    /** @type {LH.Artifacts.RawSourceMap} */
    const bundleMap = JSON.parse(fs.readFileSync(bundleMapPath, 'utf-8'));
    polyfillDependencies.set(name, bundleMap.sources.filter(s => s.startsWith('node_modules')));
  }

  const allPolyfillModules = [...polyfillDependencies.values()];
  const commonModules = allPolyfillModules[0].filter(potentialCommonModule => {
    return allPolyfillModules.every(modules => modules.includes(potentialCommonModule));
  });
  for (const [name, modules] of polyfillDependencies.entries()) {
    polyfillDependencies.set(name, modules.filter(module => !commonModules.includes(module)));
  }
  polyfillDependencies.set('common', commonModules);

  return polyfillDependencies;
}

async function main() {
  const polyfillDependencies = getPolyfillDependencies();

  const bundlePath =
    `${VARIANT_DIR}/all-legacy-polyfills/all-legacy-polyfills-core-js-3/main.bundle.min.js`;
  const bundleContents = fs.readFileSync(bundlePath, 'utf-8');
  const bundleMap = JSON.parse(fs.readFileSync(bundlePath + '.map', 'utf-8'));
  const artifacts = {
    ScriptElements: [{requestId: '', src: '', content: bundleContents}],
    SourceMaps: [{scriptUrl: '', map: bundleMap}],
  };
  // @ts-ignore
  const bundles = await JsBundles.compute_(artifacts);
  const bundleFileSizes = bundles[0].sizes.files;

  const allModules = Object.keys(bundleFileSizes).filter(s => s.startsWith('node_modules'));
  const moduleSizes = allModules.map(module => {
    return bundleFileSizes[module];
  });

  /** @type {Map<string, number[]>} */
  const polyfillDependenciesEncoded = new Map();
  for (const [name, modules] of polyfillDependencies.entries()) {
    polyfillDependenciesEncoded.set(name, modules.map(module => allModules.indexOf(module)));
  }

  const maxSize = sum(moduleSizes);
  const baseSize = sum((polyfillDependencies.get('common') || []).map(m => bundleFileSizes[m]));
  polyfillDependenciesEncoded.delete('common');
  const polyfillDependencyGraphData = {
    moduleSizes,
    dependencies: [...polyfillDependenciesEncoded.entries()].reduce((acc, [name, modules]) => {
      acc[name] = modules;
      return acc;
    }, /** @type {Record<string, number[]>} */ ({})),
    maxSize,
    baseSize,
  };

  const json = prettyJSONStringify(polyfillDependencyGraphData, {
    tab: '  ',
    spaceBeforeColon: '',
    spaceInsideObject: '',
    shouldExpand: _ => !Array.isArray(_),
  });
  fs.writeFileSync(OUTPUT_PATH, json);
}

main();
