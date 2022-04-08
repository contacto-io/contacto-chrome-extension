import { css } from 'emotion'
import { findNumbers } from 'libphonenumber-js/max'

const phoneNumberMatchRegx = /[0-9\+]*?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{2,10}[-\s\.]*?[0-9]{2,10}[-\s\.]*?[0-9]{2,10}\s*?/g
const geoLocationUrl = 'https://geolocation-db.com/json/'

const clickToCallAction = event => {
  event.preventDefault()
  event.stopPropagation()
  let crmId = ''
  const { pathname, hostname, search } = window.location
  const targetElement = event.target
  if (hostname.endsWith('lightning.force.com')) {
    // Salesforce Lightning view check
    if (pathname.endsWith('/list')) {
      // List view check
      const tableRow = targetElement.closest('tr')
      const element = tableRow && tableRow.querySelector('a[data-recordid]')
      crmId = (element && element.getAttribute('data-recordid')) || ''
    }
    if (pathname.endsWith('/view')) {
      // Detail view check
      crmId = pathname.split('/')[4]
    }
    // Contact/Lead search view check
    const parentElement = targetElement.closest('.forceSearchAssistantRecordPreview')
    const element = parentElement && parentElement.querySelector('a[data-recordid]')
    if (element) {
      crmId = element.getAttribute('data-recordid') || ''
    }
  } else if (hostname.endsWith('salesforce.com')) {
    // Salesforce Classic view check
    const pathArray = pathname.split('/')
    if (pathArray.length === 3) {
      // List view check
      const tableRow = targetElement.closest('tr')
      const element = tableRow && tableRow.querySelector('a')
      crmId = (element && element.getAttribute('href').replace('/', '')) || ''
    }
    if (pathArray.length === 2) {
      const isFilterAppliedInListView = search.length
      if (isFilterAppliedInListView) {
        // Filtered listview check
        const tableRow = targetElement.closest('tr')
        const element = tableRow && tableRow.querySelector('.x-grid3-col-FULL_NAME a')
        crmId = (element && element.getAttribute('href').replace('/', '')) || ''
      } else {
        // Detail view check
        crmId = pathArray[1]
      }
    }
  }
  const phoneNumber = targetElement.getAttribute('data-ph')
  chrome.storage.local.get(['dialDirectly'], function(result) {
    const shouldDialDirectly = !!result.dialDirectly
    let updatedURL = `contacto://call/${phoneNumber}?shouldDialDirectly=${shouldDialDirectly}`
    if (crmId) {
      // TODO: Remove changes added to avoid crash in older desktop app version once all users are on updated version
      updatedURL = `${updatedURL}://call/${phoneNumber}?shouldDialDirectly=${shouldDialDirectly}&crmId=${crmId}`
    }
    window.location.href = updatedURL
  })
}
let countryCode = localStorage.getItem('countryCode')

const rateLimitDuration = 2000
let lastLoadTime = new Date().getTime()
let timeoutID = null
let stopNumberParsing = false

function getCountryCodeThroughUsersIp() {
  return new Promise((resolve, reject) => {
    // TODO: Need to change geoLocationUrl to sellular url once login feature is enabled in extension
    fetch(geoLocationUrl)
      .then(res => res.json())
      .then(response => {
        resolve(response.country_code)
      })
      .catch(error => {
        reject(error)
      })
  })
}

const iconContainerClassName = css`
  max-width: 20px !important;
  max-height: 20px !important;
  padding-right: 3px !important;
  padding-left: 3px !important;
  display: inline-flex !important;
  animation: none !important;
`
const iconClassName = css`
  cursor: pointer !important;
  width: 12px !important;
  height: 12px !important;
`

const iconSrc = chrome.runtime.getURL('sellular-call.png')

const iconTemplate = `<span class='${iconContainerClassName}' data-ph='{{PHONE_NUMBER}}'>
  <img src='${iconSrc}' class='${iconClassName}' data-ph='{{PHONE_NUMBER}}'>
</span>`

function checkIfSalesforceClickToCallIconPresent(node) {
  if (!node.previousElementSibling || !node.previousElementSibling.classList) {
    return false
  }
  const classList = node.previousElementSibling.classList.value
  return (
    classList.includes('slds-icon-utility-call') ||
    classList.includes('slds-icon-utility-end-call') ||
    classList.includes('slds-icon-utility-end_call')
  )
}

async function parseForNumbers(firstParse = false, element = document.body) {
  // if (element.getAttribute('selliconinjected')) return
  if (!countryCode || firstParse) {
    try {
      countryCode = await getCountryCodeThroughUsersIp()
      localStorage.setItem('countryCode', countryCode)
    } catch (error) {
      console.log('error in fetching location', error)
    }
  }
  countryCode = countryCode || 'US' // Added deafult country code if API fails
  // element.setAttribute('selliconinjected', true)
  const treeWalker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        if (node.textContent.match(phoneNumberMatchRegx)) return NodeFilter.FILTER_ACCEPT
        else return NodeFilter.FILTER_REJECT
      },
    },
    false,
  )

  while (treeWalker.nextNode()) {
    const currentNode = treeWalker.currentNode
    if (currentNode.parentElement.getAttribute('selliconinjected')) continue
    if (currentNode.parentElement.closest('[contenteditable="true"]')) continue
    setTimeout(() => {
      if (!currentNode.parentElement) return
      const isSalesforceClickToCallIconPresent = checkIfSalesforceClickToCallIconPresent(
        currentNode.parentElement,
      )
      if (isSalesforceClickToCallIconPresent) return
      const nextSibling = currentNode.nextElementSibling
      if (
        nextSibling &&
        (nextSibling.title === 'Click to dial disabled' || nextSibling.title === 'Click to dial')
      ) {
        return
      }
      const text = currentNode.parentElement.innerHTML
      let modifiedText = ''
      let numbers = findNumbers(text, countryCode, { v2: true })
      if (numbers.length === 0 && typeof text === 'string') {
        if (text.startsWith('+')) return
        modifiedText = `+${text}`
        numbers = findNumbers(modifiedText, countryCode, { v2: true })
        if (numbers.length === 0) return
      }
      let finalHtml = text
      numbers.forEach(number => {
        if (text[number.startsAt - 1] === '/') return
        const phoneNumberText = text.slice(number.startsAt, number.endsAt)
        if (currentNode.textContent.indexOf(phoneNumberText) === -1) return
        const deeplinkNumber =
          phoneNumberText.startsWith('+') || modifiedText
            ? number.number.number
            : number.number.nationalNumber
        finalHtml = finalHtml.replace(
          phoneNumberText,
          iconTemplate.replace(/{{PHONE_NUMBER}}/g, deeplinkNumber) + phoneNumberText,
        )
      })
      currentNode.parentElement.setAttribute('selliconinjected', true)
      if (
        currentNode.parentElement.nodeName === 'SCRIPT' ||
        currentNode.parentElement.nodeName === 'STYLE'
      )
        return
      currentNode.parentElement.innerHTML = finalHtml
    }, 0)
  }
}

function parseSite(firstParse = false) {
  const matchedElement = document.querySelectorAll(
    ".slds-icon-utility-call, .slds-icon-utility-end-call, .slds-icon-utility-end_call, img[title='Click to dial disabled'], img[title='Click to dial']",
  )
  if (matchedElement.length) {
    stopNumberParsing = true
    document.removeEventListener('DOMNodeInserted', window.nodeInsertedSellularEvent, false)
  }
  if (stopNumberParsing) return
  lastLoadTime = new Date().getTime()
  parseForNumbers(firstParse)

  setTimeout(() => {
    const icons = document.getElementsByClassName(iconContainerClassName)
    Array.from(icons).forEach(function(element) {
      element.removeEventListener('click', window.clickToCallAction)
      window.clickToCallAction = clickToCallAction
      element.addEventListener('click', clickToCallAction)
    })
  }, 10)
}

parseSite(true)

document.removeEventListener('DOMNodeInserted', window.nodeInsertedSellularEvent, false)

window.nodeInsertedSellularEvent = e => {
  if (new Date().getTime() - lastLoadTime < rateLimitDuration) {
    clearTimeout(timeoutID)
    timeoutID = setTimeout(() => {
      parseSite()
    }, rateLimitDuration)
  } else {
    parseSite()
  }
}

document.addEventListener('DOMNodeInserted', window.nodeInsertedSellularEvent, false)
