import { addMapLayer } from './Map.js';

const client = new CKAN.Client('https://open.nrw/');

const fetchWMS = function fetchWMS () {
  return new Promise(function (resolve, reject) {
    client.action('package_search', {
      fq: 'res_format:wms',
      rows: 20
    }, function (err, out) {
        if (err) {
          return reject(err);
        }

        if (!out.result || !Array.isArray(out.result.results) || !out.result.results[0]) {
          return reject(new Error('No results found'));
        }

        const results = [];
        for (const result of out.result.results) {
          result.wmsUrls = [];

          for (const { url, description, format } of result.resources) {
            if (format === 'wms'
            && (
                url.toLowerCase().includes('getcapabilities')
                ||
                url.toLowerCase().includes('wms')
              )
            ) {
              result.wmsUrls.push({ url, description });
            }
          }

          if (result.wmsUrls.length !== 0) {
            results.push(result);
          }
        }

        return resolve(results);
    });
  });
};

const hideElement = function hideElement(id, hidden) {
  if (!hidden) {
    document.getElementById(id).setAttribute('hidden', true);
  } else {
    document.getElementById(id).removeAttribute('hidden');
  }
};

const showLoading = function showLoading (hidden = false) {
  hideElement('opennrw_wms_loading', hidden);
};

const showError = function showError (hidden = false) {
  hideElement('opennrw_wms_error', hidden);
};


const createParent = function createParent(title, urls) {
  const parent = document.createElement('li');

  const titleElem = document.createElement('p');
  titleElem.textContent = title;
  parent.appendChild(titleElem);

  const childUl = document.createElement('ul');

  for (const { url, description } of urls) {
    const newElem = document.createElement('li');
    newElem.textContent = `${description}`;
    newElem.setAttribute('title', url);

    childUl.appendChild(newElem);
  }
  parent.appendChild(childUl);

  return parent;
};

const addResults = function addResults(results) {
  const resultsElement = document.getElementById('opennrw_wms_results');

  for (const { title, wmsUrls } of results) {
    const p = createParent(title, wmsUrls);
    resultsElement.appendChild(p);
  }
};

export default function init () {
  showLoading(true);
  fetchWMS()
    .then(function (results) {
      addResults(results);
      showLoading(false);
    })
    .catch(function (err) {
      showError(true);
      console.log(err);
    });
};
