/* global chrome */
import { useState } from "react";
import { makeStyles } from "@material-ui/styles";
import { Box, Button, Typography } from "@mui/material";

function ContentScript() {
  console.log('start');
  const apiLogin = "https://theeasystreet.duckdns.org/login";
  const apiUrlMarketplace = 'https://theeasystreet.duckdns.org/marketplace';
  const apiUrlListings = 'https://theeasystreet.duckdns.org/listing';
  const apiUrlSold = 'https://theeasystreet.duckdns.org/sold';

  var matches = [];
  var filteredMatches = [];
  var appliedFilters = [];
  var listingNumsCount = 0;

  const ie = document.createElement("div");
  const test = document.createElement("p");
  const l = ie.attachShadow({
      mode: "open"
  });

  document.body.appendChild(ie);

  var A = document.createElement("div");
  A.className = "easystreet_hover-button";

  let de = document.createElement("img");
  de.className = "easystreet_hover-button-img";
  de.src = chrome.runtime.getURL("assets/512x512.png");
  A.appendChild(de);
  const x = document.createElement("div");
  x.className = "easystreet_hover-button-text";
  A.appendChild(x);

  let g = document.createElement("div");
  g.className = "easystreet_main-container";
  var a = document.createElement("div");
  a.id = "easystreet_header";
  g.appendChild(a);

  ["static/css/popup.css"].forEach(e => {
      let t = document.createElement("link");
      t.href = chrome.runtime.getURL(e);
      t.type = "text/css";
      t.rel = "stylesheet";
      let fontLink = document.createElement("link");
      fontLink.href = "https://fonts.googleapis.com/css?family=Barlow:500%7CBarlow:600%7CLato:regular%7CPublic+Sans:regular%7CPublic+Sans:500%7CPublic+Sans:italic%7CPublic+Sans:regular%22";
      fontLink.rel = "stylesheet";
      document.head.appendChild(fontLink);
      let fontLink2 = document.createElement("link");
      fontLink2.href = "https://fonts.googleapis.com/css2?family=Righteous&display=swap";
      fontLink2.rel = "stylesheet";
      document.head.appendChild(fontLink2);
      l.appendChild(t);
      t.addEventListener("load", e => {
          l.appendChild(A);
          l.appendChild(g);
      })
  });

  const te = document.createElement("div");
  te.className = "easystreet_left-buttons";
  a.appendChild(te);

  let me = document.createElement("p");
  me.id = "easystreet_title";
  me.innerText = "Easy Street";
  me.className = "easystreet_logo";
  a.appendChild(me);


  const ue = document.createElement("div");
  ue.className = "easystreet_right-buttons";
  a.appendChild(ue);

  const pe = document.createElement("img");
  pe.src = chrome.runtime.getURL("assets/cross.png");
  pe.className = "easystreet_close";
  pe.addEventListener("click", () => {
      g.classList.remove("active");
      g.classList.remove("show");
      A.style.display = "flex";
      let fil = l.getElementById("easystreet_filterDiv");
      fil.style.display = "none";
  });

  async function fetchJsonLD(url) {
    console.log('fetchJsonLd');
      try {
          const response = await fetch(url);
          const html = await response.text();

          let productName;
          let productImage;
          let brandName;
          let productPrice;

          const jsonLD = html.match(/<script[^>]*type="?application\/ld\+json"?[^>]*>[\s\S]*?<\/script\b[^>]*>/g);
          const nextData = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>[\s\S]*?<\/script\b[^>]*>/g);
          const scripts = html.match(/<script[^>]*>[\s\S]*?<\/script\b[^>]*>/g);

          if (jsonLD != null && Array.isArray(jsonLD)) {
              jsonLD.forEach(script => {
                  const startIndex = script.indexOf(">") + 1;
                  const endIndex = script.lastIndexOf("<");
                  let jsonString = script.substring(startIndex, endIndex).trim();
                  if (jsonString !== "") {
                      const jsonData = JSON.parse(jsonString);
                      if (jsonData['@type'] === "Product") {
                          productName = jsonData.name.split('\n')[0];
                          if (Array.isArray(jsonData.image)) {
                              if (jsonData.image[0].contentUrl) {
                                  productImage = jsonData.image[0].contentUrl;
                              } else {
                                  productImage = jsonData.image[0];
                              }
                          } else if (typeof jsonData.image === 'object') {
                              if (jsonData.image.contentUrl) {
                                  productImage = jsonData.image.contentUrl;
                              } else if (jsonData.image.url) {
                                  productImage = jsonData.image.url;
                              } else {
                                  productImage = jsonData.image.image;
                              }
                          } else {
                              productImage = jsonData.image;
                          }
                          brandName = jsonData.brand.name;
                          if (jsonData.offers) {
                              if (Array.isArray(jsonData.offers)) {
                                  let firstAvailableOffer = jsonData.offers.find(offer => offer.price);
                                  if (firstAvailableOffer) {
                                      productPrice = firstAvailableOffer.price;
                                  }
                              } else if (Array.isArray(jsonData.offers.offers)) {
                                  let firstAvailableOffer = jsonData.offers.offers.find(offer => offer.price);
                                  if (firstAvailableOffer) {
                                      productPrice = firstAvailableOffer.price;
                                  }
                              } else if (jsonData.offers.price) {
                                  productPrice = jsonData.offers.price;
                              }
                          }
                      }
                  }
              });
          }

          if (!productName || !productImage || !brandName || !productPrice) {
              if (nextData && Array.isArray(nextData)) {
                  const nextDataScript = nextData[0];
                  const startIndex = nextDataScript.indexOf(">") + 1;
                  const endIndex = nextDataScript.lastIndexOf("<");
                  const jsonString = nextDataScript.substring(startIndex, endIndex);
                  const jsonData = JSON.parse(jsonString);
                  const { props } = jsonData;
          
                  if (props) {
                      const queries = props.pageProps.req?.appContext?.states?.query?.value?.queries;
                      if (queries) {
                          let productQuery = queries.find(query => query.queryKey?.[0] === 'GetProduct');
                          
                          if (productQuery?.state?.data?.product) {
                              const product = productQuery.state.data.product;
                              productName = productName || product.title;
                              productImage = productImage || product.media.imageUrl;
                              brandName = brandName || product.brand;
                              productPrice = productPrice || product.market.bidAskData.lowestAsk;
                          }
                      }
                      else if (props.pageProps?.productTemplate) {
                          productName = productName || props.pageProps.productTemplate.name;
                          productImage = productImage || props.pageProps.productTemplate.mainPictureUrl;
                          brandName = brandName || props.pageProps.productTemplate.brandName;
                          productPrice = productPrice || (props.pageProps.productTemplate.specialDisplayPriceCents ? props.pageProps.productTemplate.specialDisplayPriceCents / 100 : null);
                      }
                  }
              }
          }

          // if (!productName || !productImage || !brandName || !productPrice) {
          //     if (scripts && Array.isArray(scripts)) {
          //         let stateScript;
          //         scripts.forEach(script => {
          //             if (script.includes('window.state')) {
          //                 stateScript = script;
          //             }
          //         });
                  
          //         if (stateScript) {
          //             if (stateScript.includes('window.state=')) {
          //                 const stateString = stateScript.split('window.state=')[1].split('</script>')[0].trim();
          //                 const stateData = JSON.parse(stateString);
                          
          //                 productName = stateData.pdp.detailsState.response.body.products[0].productColours[0].shortDescription;
          //                 productImage = stateData.pdp.detailsState.response.body.products[0].productColours[0].imageTemplate;
          //                 if (productImage) {
          //                     productImage = productImage.replace("{view}", "in").replace("{width}", "560_q60");
          //                     productImage = "https:" + productImage
          //                 }
          //                 brandName = stateData.pdp.detailsState.response.body.products[0].designerName;
          //                 productPrice = stateData.pdp.detailsState.response.body.products[0].price.sellingPrice.amount;
          //             }
          //         }
          //     }                     
          // }

          if (!productName || !productImage || !brandName || !productPrice) {
              const parser = new DOMParser();
              const doc = parser.parseFromString(html, "text/html");
              productName = doc.querySelector("[itemprop='name']")?.getAttribute("content") || doc.querySelector("meta[property='og:title']")?.getAttribute("content");
              productImage = doc.querySelector("[itemprop='image']")?.getAttribute("src") || doc.querySelector("meta[property='og:image']")?.getAttribute("content");
              if (productImage.startsWith("//")) {
                  productImage = "https:" + productImage;
              }
              brandName = doc.querySelector("[itemprop='brand']")?.innerText || doc.querySelector("meta[property='og:site_name']")?.getAttribute("content");
              productPrice = doc.querySelector("[itemprop='price']")?.innerText || doc.querySelector("meta[property='og:price:amount']")?.getAttribute("content");
          }

          if (productName && productImage && brandName && productPrice) {
              brandName = standardizedEAccent(brandName);
              loginToEasyStreet(brandName, productImage, productName, formatPrice(JSON.stringify(productPrice)));
          } else {
              A.style.display = "none";
              g.style.display = "none";
          }
      } catch (error) {
          console.log(error);
      }
  }


  function createHTML(matchAttemptNum, brandname, productname, listingNumsCount) {
    console.log('createhtml');
      const container = document.createElement("div");
      container.id = "easystreet_container";

      const main = document.createElement("main");
      main.id = "easystreet_content";
      const mainListing = document.createElement("div");
      mainListing.id = "easystreet_main-listing";
      const mainImg = document.createElement("img");
      mainImg.id = "easystreet_mainimg";
      mainImg.alt = "Main Product";
      const mainListingInfo = document.createElement("div");
      mainListingInfo.id = "easystreet_main-listing-info";
      const mainBrand = document.createElement("p");
      mainBrand.id = "easystreet_mainbrand";
      mainBrand.textContent = "Brand Name";
      const mainName = document.createElement("p");
      mainName.id = "easystreet_mainname";
      mainName.textContent = "Item Name";
      mainListingInfo.appendChild(mainBrand);
      mainListingInfo.appendChild(mainName);
      mainListing.appendChild(mainImg);
      mainListing.appendChild(mainListingInfo);
      main.appendChild(mainListing);
      const listingNum = document.createElement("div");
      listingNum.id = "easystreet_listingNum";

      const listingsAndSortingDiv = document.createElement("div");
      listingsAndSortingDiv.id = "easystreet_sorting-split";
      listingsAndSortingDiv.appendChild(listingNum);

      main.appendChild(listingsAndSortingDiv);

      addMatchingListingsHTML(main);

      const status_div = document.createElement("div");
      status_div.id = "status_div";
      const p = document.createElement("p");
      p.id = "status";
      p.textContent = "Navigate to a product page to browse listings across secondhand marketplaces.";
      status_div.appendChild(p);

      const footer = document.createElement("footer");
      footer.classList.add("easystreet_footer");
      const howLink = document.createElement("a");
      howLink.id = "es-about";
      howLink.href = "https://theeasystreet.co/";
      howLink.target = "_blank";
      howLink.textContent = "How It Works";
      howLink.classList.add("easystreet_leftMostLink");
      const contactLink = document.createElement("a");
      contactLink.id = "es-contact";
      contactLink.href = "https://theeasystreet.co/contact";
      contactLink.target = "_blank";
      contactLink.textContent = "Contact Us";
      const ppLink = document.createElement("a");
      ppLink.id = "es-pp";
      ppLink.href = "https://theeasystreet.co/privacy-browser-extension";
      ppLink.target = "_blank";
      ppLink.textContent = "Privacy Policy";
      const termsLink = document.createElement("a");
      termsLink.id = "es-terms";
      termsLink.href = "https://theeasystreet.co/terms";
      termsLink.target = "_blank";
      termsLink.textContent = "Terms";
      termsLink.classList.add("easystreet_rightMostLink");
      footer.appendChild(howLink);
      footer.appendChild(contactLink);
      footer.appendChild(ppLink);
      footer.appendChild(termsLink);

      const select = document.createElement('select');
      select.id = 'easystreet_sort-select';

      let relevance = document.createElement('option');
      relevance.value = 'relevance';
      relevance.text = 'Relevance';
      select.appendChild(relevance);

      let priceLowToHighOption = document.createElement('option');
      priceLowToHighOption.value = 'price-low-to-high';
      priceLowToHighOption.text = 'Price: Low to High';
      select.appendChild(priceLowToHighOption);

      let priceHighToLowOption = document.createElement('option');
      priceHighToLowOption.value = 'price-high-to-low';
      priceHighToLowOption.text = 'Price: High to Low';
      select.appendChild(priceHighToLowOption);

      select.addEventListener('change', () => {
          let sortOption = select.value;
          sortProducts(matchAttemptNum, sortOption, brandname, productname);
      });

      const fe = document.createElement("img");
      fe.src = chrome.runtime.getURL("assets/easystreet_filter.png");
      fe.id = "easystreet_filter-button";

      var filterDiv = document.createElement('div');
      filterDiv.id = "easystreet_filterDiv";
      filterDiv.style.display = 'none';
      l.appendChild(filterDiv);

      var filters = document.createElement('div');
      filters.id = "easystreet_filters";
      filterDiv.appendChild(filters);

      container.appendChild(main);
      te.appendChild(fe);
      ue.appendChild(pe);
      listingsAndSortingDiv.appendChild(select);
      container.appendChild(status_div);
      container.appendChild(footer);
      g.appendChild(container);
  }

  function addMatchingListingsHTML(main) {
    console.log('addMatchingListingsHTML');
      const matchingListings = document.createElement("div");
      matchingListings.classList.add("easystreet_matching-listings");
      const column1 = document.createElement("div");
      column1.id = "easystreet_column1";
      const column2 = document.createElement("div");
      column2.id = "easystreet_column2";
      matchingListings.appendChild(column1);
      matchingListings.appendChild(column2);
      main.appendChild(matchingListings);
  }

  function addMatchingListingsHTML_Row(main) {
      const matchingListings = document.createElement("div");
      matchingListings.classList.add("easystreet_matching-listings");
      const column1 = document.createElement("div");
      column1.id = "easystreet_column1";
      const column2 = document.createElement("div");
      column2.id = "easystreet_column2";
      matchingListings.appendChild(column1);
      matchingListings.appendChild(column2);
      main.appendChild(matchingListings); 
  }

  async function loginToEasyStreet(brandName, productImage, productName, formattedPrice, match_found) {
      console.log('loginToEasyStreet');
      let ret = "";

      let res = await fetch(apiLogin, {
          method: 'POST',
          credentials: 'include',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
          }
      });

      if (res.status === 200) {
          try {
              const json = await res.json();
              ret = json.token;
          } catch (error) {
              try {
                  const json = await res.text();
              } catch (error) {
                  return null;
              }
          }
      } else {
          return null;
      }
      let matchAttemptNum = generateUUID();
      (async () => {
          let urlshort = (document.location.href).split('.com')[0] + '.com';
          const response = await chrome.runtime.sendMessage({
              greeting: "matchAttempt",
              brand: brandName,
              product: productName,
              matchid: matchAttemptNum,
              url: urlshort
          });
      })();
      checkListingTable(brandName, productImage, productName, formattedPrice, matchAttemptNum, match_found, ret);
  }

  async function checkListingTable(pageBrand, pageImage, pageName, pagePrice, matchAttemptNum, match_found, token) {
      console.log('checkListingTable');
      const ret = await fetchData(apiUrlListings, pageBrand, pageName, pageImage, match_found, token);

      if (ret != null) {
          if (ret.best_match) {
              let name = ret.best_match;
              let image = ret.item_image;
              let match_found = ret.match_found;
              createHTML(matchAttemptNum, pageBrand, name);
              calculateSold(pageBrand, name, pagePrice, pageImage, match_found, token);
              updateMainProductListing(name, pageImage, image, pageBrand);
              findMatches(pageBrand, name, pageImage, matchAttemptNum, match_found, token);
          }
      }
  }

  function updateMainProductListing(productName, pageImage, officialImage, brandName, isListing) {
      console.log('updateMainProductListing');
      const name = l.getElementById("easystreet_mainname");
      const img = l.getElementById("easystreet_mainimg");
      const brand = l.getElementById("easystreet_mainbrand");
      const listing = l.getElementById("easystreet_main-listing");

      name.innerHTML = productName;

      let productImage = pageImage.toString();

      productImage = (productImage.indexOf("shopify") > -1 && productImage.indexOf("aimeleondore.com") === -1) ? "https:" + productImage : productImage;
      productImage = (productImage.indexOf("depop") > 0) ? productImage.substring(0, productImage.indexOf(",")) : productImage;

      if (isImage(officialImage)) {
          img.src = officialImage;
      } else {
          img.src = productImage;
      }

      brand.innerHTML = brandName;
      listing.style.display = "flex";
  }

  function checkIfImageExists(url, callback) {
      const img = new Image();
      img.src = url;

      if (img.complete) {
          callback(true);
      } else {
          img.onload = () => {
              callback(true);
          };

          img.onerror = () => {
              callback(false);
          };
      }
  }

  async function findMatches(brand, name, image, matchAttemptNum, match_found, token) {
    console.log('findMatches');
      let ret = await fetchData(apiUrlMarketplace, brand, name, image, match_found, token);

      for (var i = 0; i < ret.length; i++) {
          if (ret[i].image_image && ret[i].image_image === image) {
              ret.splice(i, 1);
              i--;
          } else if (ret[i].image_image && ret[i].image_image.indexOf("ebayimg") > 0 && image.indexOf("ebayimg") > 0) {
              if (extractEbayProductId(ret[i].link_text) === extractEbayProductId(document.location.href)) {
                  ret.splice(i, 1);
                  i--;
              }
          }
      }

      (async () => {
          let urlshort = (document.location.href).split('.com')[0] + '.com';
          listingNumsCount = ret.length;
          x.innerText = listingNumsCount + " Listings Found";
          const response = await chrome.runtime.sendMessage({
              greeting: "matchFound",
              matchid: matchAttemptNum,
              brand: brand,
              product: name,
              listingNums: listingNumsCount,
              url: urlshort
          });
      })();

      (async () => {
          let urlshort = (document.location.href).split('.com')[0] + '.com';
          const response = await chrome.runtime.sendMessage({
              greeting: "buttonAppears",
              matchid: matchAttemptNum,
              brand: brand,
              product: name,
              url: urlshort,
              listingNums: listingNumsCount
          });
      })();

      let fb = l.getElementById("easystreet_filter-button");
      let filterDiv = l.getElementById("easystreet_filterDiv");

      fb.addEventListener('click', function() {
          if (filterDiv.style.display === 'none') {
              filterDiv.style.display = 'block';
              (async () => {
                      let urlshort = (document.location.href).split('.com')[0] + '.com';
                      const response = await chrome.runtime.sendMessage({
                          greeting: "filtersClick",
                          matchid: matchAttemptNum,
                          brand: brand,
                          product: name,
                          url: urlshort,
                          listingNums: listingNumsCount
                      });
                  })();
          } else {
              filterDiv.style.display = 'none';
          }
      });

      if (ret.length == 0) {
          l.getElementById("status").style.display = "flex";
          l.getElementById("status").innerHTML = "No matches are found for your product.";
      } else {
          matches = ret;
          filteredMatches = ret;
          createFilters(matchAttemptNum, brand, name);
          sortProducts(matchAttemptNum, "relevance", brand, name);
          (async () => {
              let urlshort = (document.location.href).split('.com')[0] + '.com';
              const response = await chrome.runtime.sendMessage({
                  greeting: "buttonAppears",
                  matchid: matchAttemptNum,
                  brand: brand,
                  product: name,
                  url: urlshort,
                  listingNums: listingNumsCount
              });
          })();
      }
      return ret;
  }

  function createFilters(matchAttemptNum, brand, product) {
    console.log('createFilters');
      var sizeOptions = new Set();
      var conditionOptions = new Set();
      var marketplaceOptions = new Set();
      var colorOptions = new Set();

      matches.forEach(function(match) {
          if (Array.isArray(match.size_text)) {
              match.size_text.forEach(size => sizeOptions.add(size));
          } else {
              sizeOptions.add(match.size_text);
          }
          conditionOptions.add(match.condition_text);
          marketplaceOptions.add(match.marketplace_text);
          colorOptions.add(match.color_text);
      });

      const clothingSizesTops = ["7xs", "6xs", "5xs", "4xs", "3xs", "xxs", "xs", "s", "m", "l", "xl", "xxl", "3xl", "4xl", "5xl", "6xl", "7xl"];
      const clothingSizesBottoms = Array.from({length: 33}, (_, i) => (i + 18).toString());

      const sortedOptions = [...sizeOptions].sort((a, b) => {
          // Adult Sizes
          const isAAdult = a.toUpperCase().startsWith("US M");
          const isBAdult = b.toUpperCase().startsWith("US M");
          if (isAAdult && isBAdult) {
              const aAdultNum = parseFloat(a.split(" ")[2]);
              const bAdultNum = parseFloat(b.split(" ")[2]);
              return aAdultNum - bAdultNum;
          }
          if (isAAdult) return -1;
          if (isBAdult) return 1;
      
          // Child Sizes
          const isAChild = a.toUpperCase().startsWith("US CHILD");
          const isBChild = b.toUpperCase().startsWith("US CHILD");
          if (isAChild && isBChild) {
              const aChildNum = parseFloat(a.split(" ").pop());
              const bChildNum = parseFloat(b.split(" ").pop());
              return aChildNum - bChildNum;
          }
          if (isAChild) return -1;
          if (isBChild) return 1;
      
          // clothingSizesTops
          const aIndexTop = clothingSizesTops.indexOf(a.toLowerCase());
          const bIndexTop = clothingSizesTops.indexOf(b.toLowerCase());
          if (aIndexTop !== -1 && bIndexTop !== -1) {
              return aIndexTop - bIndexTop;
          }
          if (aIndexTop !== -1) return -1;
          if (bIndexTop !== -1) return 1;
      
          // clothingSizesBottoms
          const aIndexBottom = clothingSizesBottoms.indexOf(a.toLowerCase());
          const bIndexBottom = clothingSizesBottoms.indexOf(b.toLowerCase());
          if (aIndexBottom !== -1 && bIndexBottom !== -1) {
              return aIndexBottom - bIndexBottom;
          }
          if (aIndexBottom !== -1) return -1;
          if (bIndexBottom !== -1) return 1;
      
          // Various
          if (a.toUpperCase() === "VARIOUS") return 1;
          if (b.toUpperCase() === "VARIOUS") return -1;
      
          // Anything else
          return a.localeCompare(b);
      });    
      

      sizeOptions = sortedOptions.filter(option => option && option.trim() !== '');
      marketplaceOptions = [...marketplaceOptions].filter(option => option && option.trim() !== '').sort();
      conditionOptions = [...conditionOptions].filter(option => option && option.trim() !== '').sort();
      colorOptions = [...colorOptions].filter(option => option && option.trim() !== '').sort();

      var filterOptions = [{
              category: 'Condition',
              options: Array.from(conditionOptions).map(option => ({
                  label: option.toTitleCase(),
                  value: option.toLowerCase()
              }))
          },
          {
              category: 'Size',
              options: Array.from(sizeOptions).map(option => ({
                  label: option.toUpperCase(),
                  value: option.toLowerCase()
              }))
          },
          {
              category: 'Marketplace',
              options: Array.from(marketplaceOptions).map(option => ({
                  label: option.toTitleCase(),
                  value: option.toLowerCase()
              }))
          },
          {
              category: 'Color',
              options: Array.from(colorOptions).map(option => ({
                  label: option.toTitleCase(),
                  value: option.toLowerCase()
              }))
          }
      ];

      let filterObject = l.getElementById("easystreet_filters");

      for (var i = 0; i < filterOptions.length; i++) {
          var categoryLabel = document.createElement('label');
          categoryLabel.appendChild(document.createTextNode(filterOptions[i].category));
          filterObject.appendChild(categoryLabel);

          var optionDiv = document.createElement('div');
          filterObject.appendChild(optionDiv);

          for (var j = 0; j < filterOptions[i].options.length; j++) {
              var checkbox = document.createElement('input');
              checkbox.type = 'checkbox';
              checkbox.name = filterOptions[i].category;
              checkbox.value = filterOptions[i].options[j].value;

              var label = document.createElement('label');
              label.appendChild(document.createTextNode(filterOptions[i].options[j].label));

              checkbox.addEventListener('change', (function(filterOption, category) {
                  return function(event) {
                      if (event.target.checked) {
                          filterProducts(filterOption, category, false, matchAttemptNum, brand, product);
                      } else {
                          filterProducts(filterOption, category, true, matchAttemptNum, brand, product);
                      }
                  }
              })(filterOptions[i].options[j].label, filterOptions[i].category));

              var checkboxContainer = document.createElement('div');
              checkboxContainer.className = 'checkbox-container';
              checkboxContainer.appendChild(checkbox);
              checkboxContainer.appendChild(label);
              optionDiv.appendChild(checkboxContainer);
          }
      }
  }

  function extractEbayProductId(url) {
    console.log('extractEbayProductId');
      const regex = /\/(\d+)\??/;
      const match = url.match(regex);
      if (match && match[1]) {
        return match[1];
      } else {
        return null;
      }
  }

  async function fetchData(url, brand, name, image_url, match_found, key) {
    console.log('fetchData');
      let ret = [];
      let params;

      params = new URLSearchParams({
          brand: brand,
          name: name,
          image_url: image_url,
          match_found: match_found
      });

      let res = await fetch(url + '?' + params.toString(), {
          referrerPolicy: 'strict-origin-when-cross-origin',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': 'Bearer ' + key
          }
      });

      if (res.status === 200) {
          const contentType = res.headers.get("Content-Type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
              try {
                  const json = await res.json();
                  return json;
              } catch (error) {
                  return null;
              }
          } else {
              const text = await res.text();
              return text;
          }
      } else {
          return null;
      }
  }

  async function calculateSold(brand, name, image_url, match_found, price, token) {
      console.log('calculateSold');
      let ret = await fetchData(apiUrlSold, brand, name, image_url, match_found, token);

      if (ret.num_sales >= 4) {
          createPricingBar(ret.min_price, ret.percentile25, ret.avg_price, ret.percentile75, ret.max_price, brand, name, price);
          addMainListingPricingInfo(ret.avg_price, ret.percentile25, ret.percentile75, ret.num_sales);
      }
  }

  function createPricingBar(low, percentile25, average, percentile75, high, brand, name, price) {
    console.log('createPricingBar');
      const priceCard = document.createElement('div');
      priceCard.classList.add('easystreet_priceCard');

      const diagramContainer = document.createElement('div');
      diagramContainer.classList.add('easystreet_PriceCard-container');
      const priceDiagram = document.createElement('div');
      priceDiagram.classList.add('easystreet_PriceContainer-diagram');
      diagramContainer.appendChild(priceDiagram);
      priceCard.appendChild(diagramContainer);

      const priceDisplay = document.createElement('div');
      priceDisplay.classList.add('easystreet_PriceDiagram-display');
      priceDisplay.dataset.transition = true;
      priceDisplay.style.left = '75%';
      priceDiagram.appendChild(priceDisplay);

      const centerBubble = document.createElement('div');
      centerBubble.classList.add('easystreet_PriceDiagram-medianbubble');
      centerBubble.style.transform = `translate(${getTranslationValue(low, percentile25, percentile75, high, price)}px, 5px)`;
      priceDisplay.appendChild(centerBubble);

      const dataLine = document.createElement('div');
      dataLine.classList.add('easystreet_PriceDiagram-line');
      priceDiagram.appendChild(dataLine);

      const lowPrice = document.createElement('div');
      lowPrice.classList.add('easystreet_PriceDiagram-color', 'easystreet_PriceDiagram-low');
      const lowPricePercentile = document.createElement('div');
      lowPricePercentile.classList.add('easystreet_PriceDiagram-percentile');
      lowPrice.appendChild(lowPricePercentile);
      dataLine.appendChild(lowPrice);

      const mediumPrice = document.createElement('div');
      mediumPrice.classList.add('easystreet_PriceDiagram-color', 'easystreet_PriceDiagram-medium');
      const mediumPricePercentile1 = document.createElement('div');
      mediumPricePercentile1.classList.add('easystreet_PriceDiagram-percentile');
      mediumPricePercentile1.innerText = '$' + percentile25;
      const mediumPricePercentile2 = document.createElement('div');
      mediumPricePercentile2.classList.add('easystreet_PriceDiagram-percentile');
      mediumPricePercentile2.innerText = '$' + percentile75;
      mediumPrice.appendChild(mediumPricePercentile1);
      mediumPrice.appendChild(mediumPricePercentile2);
      dataLine.appendChild(mediumPrice);

      const highPrice = document.createElement('div');
      highPrice.classList.add('easystreet_PriceDiagram-color', 'easystreet_PriceDiagram-high');
      const highPricePercentile = document.createElement('div');
      highPricePercentile.classList.add('easystreet_PriceDiagram-percentile');
      highPrice.appendChild(highPricePercentile);
      dataLine.appendChild(highPrice);

      var priceBarPosition;

      if (document.location.href.includes("grailed.com")) {
          priceBarPosition = document.querySelector("#__next > div > main > div > div.MainContent_mainContent__zwgc9 > div.MainContent_sidebar__29G6s > div.MainContent_group__dQ62v.MainContent_flex__T5KTh > div.Price_root__p4MOk.MainContent_item__PIrxq.MainContent_price__RSyWC.Price_large__sYrnO");
          if(priceBarPosition != null) {
              priceBarPosition.appendChild(priceCard);
          }
      } else if (document.location.href.includes("aimeleondore.com")) {
          priceBarPosition = document.querySelector("#shopify-section-product-template-new > div.pdp.product > div.product__container.d-lg-flex.justify-content-between > div.product-heading > div > div.simplebar-wrapper > div.simplebar-mask > div > div > div > div.d-flex.align-items-center.justify-content-between.d-lg-block.product-heading__mobile");
          if(priceBarPosition != null) {
              priceBarPosition.appendChild(priceCard);
          }
      } else if (document.location.href.includes("ebay.com")) {
          priceBarPosition = document.querySelector("#mainContent > form > div.vim-buybox-wrapper > div > div:nth-child(1) > div.x-buybox__price-section > div.vim.x-bin-price > div.x-bin-price__content > div.x-price-primary");
          if(priceBarPosition != null) {
              priceBarPosition.appendChild(priceCard);
          }
      } else if (document.location.href.includes("jjjound.com")) {
          priceBarPosition = document.querySelector("#shopify-section-product > div > div.product__information > form > div.product-form__header > div.product__price");
          if(priceBarPosition != null) {
              priceBarPosition.appendChild(priceCard);
          }
      } else if (document.location.href.includes("therealreal.com")) {
          priceBarPosition = document.querySelector("body > div.body-wrapper > div.container > main > div > div.pdp-two-cols > div.pdp-content > div.price-info");
          if(priceBarPosition != null) {
              priceBarPosition.appendChild(priceCard);
          }
      } else if (document.location.href.includes("poshmark.com")) {
          priceBarPosition = document.querySelector("#content > div > div > div:nth-child(3) > div.listing__layout-grid.listing__layout-item.listing__info.col-x24.col-m12 > div.listing__ipad-centered.d--fl.ai--c.m--t--5");
          if(priceBarPosition != null) {
              priceBarPosition.appendChild(priceCard);
          }
      } else if (document.location.href.includes("johnelliott.com")) {
          priceBarPosition = document.querySelector("#pdpEss > div.pdp__left");
          if(priceBarPosition != null) {
              priceBarPosition.appendChild(priceCard);
          }
      } else if (document.location.href.includes("3sixteen.com")) {
          priceBarPosition = document.querySelector("#product-title-small");
          if(priceBarPosition != null) {
              priceBarPosition.appendChild(priceCard);
          }
      } else if (document.location.href.includes("stockx.com")) {
          priceBarPosition = document.querySelector("#main-content > div > section > div:nth-child(2) > div > div.css-gg4vpm > div.css-0 > div.css-0 > div");
          if(priceBarPosition != null) {
              priceBarPosition.after(priceCard);
          }
      } else if (document.location.href.includes("depop.com")) {
          priceBarPosition = document.querySelector("#main > div.styles__Layout-sc-__sc-1fk4zep-2.kQytFU > div.styles__ContentWrapper-sc-__sc-1fk4zep-3.gfEHsG > div.ProductDetailsStickystyles__Wrapper-sc-__sc-17vfpzd-0.gTTGxO.styles__StyledProductDetailsSticky-sc-__sc-1fk4zep-12.kfpThX > div.ProductDetailsStickystyles__DesktopKeyProductInfo-sc-__sc-17vfpzd-9.gxAWoJ > h1");
          document.body.classList.add('depopFormatPriceCard');
          if (priceBarPosition != null) {
              priceBarPosition.appendChild(priceCard);
          }
      } else {
          priceBarPosition = null;
      }
  }

  function getTranslationValue(min, p25, p75, max, associatedNumber) {
    console.log('getTranslationValue');
      const range1 = p25 - min;
      const range2 = p75 - p25;
      const range3 = max - p75;

      let value = -50;

      if (associatedNumber <= p25) {
          const percentage = (associatedNumber - min) / range1;
          value = -135 + 35 * percentage;
      } else if (associatedNumber <= p75) {
          const percentage = (associatedNumber - p25) / range2;
          value = -100 + 99 * percentage;
      } else {
          const percentage = (associatedNumber - p75) / range3;
          value = -1 + 36 * percentage;
      }

      if (value < -135) {
          value = -135;
      } else if (value > 35) {
          value = 35;
      }

      return value;
  }

  function addMainListingPricingInfo(average, low, high, numOfSales) {
    console.log('addMainListingPricingInfo');
      let averagePriceBox = document.createElement('div');
      averagePriceBox.id = "avgpricebox";
      let averagePrice = document.createElement('p');
      averagePrice.innerHTML = "$" + average;
      averagePrice.id = "avgprice";
      let averagePriceLabel = document.createElement('p');
      averagePriceLabel.innerHTML = "Avg. Price";
      averagePriceLabel.id = "avgpricelabel";
      averagePriceBox.appendChild(averagePrice);
      averagePriceBox.appendChild(averagePriceLabel);

      let numSalesBox = document.createElement('div');
      numSalesBox.id = "numsalesbox";
      let numSales = document.createElement('p');
      numSales.innerHTML = numOfSales;
      numSales.id = "numsales";
      let numSalesLabel = document.createElement('p');
      numSalesLabel.innerHTML = "# of Sales";
      numSalesLabel.id = "numsaleslabel";
      numSalesBox.appendChild(numSales);
      numSalesBox.appendChild(numSalesLabel);

      let priceRangeBox = document.createElement('div');
      priceRangeBox.id = "pricerangebox"
      let priceRange = document.createElement('p');
      priceRange.innerHTML = "$" + low + "-" + "$" + high;
      priceRange.id = "pricerange";
      let priceRangeLabel = document.createElement('p');
      priceRangeLabel.innerHTML = "Price Range";
      priceRangeLabel.id = "pricerangelabel";
      priceRangeBox.appendChild(priceRange);
      priceRangeBox.appendChild(priceRangeLabel);

      let salesAndAverageDiv = document.createElement("div");
      salesAndAverageDiv.id = "easystreet_maininfobottomdiv";
      salesAndAverageDiv.appendChild(averagePriceBox);
      salesAndAverageDiv.appendChild(numSalesBox);

      let mainprodname = l.getElementById("easystreet_mainname");
      mainprodname.after(salesAndAverageDiv);
      mainprodname.after(priceRangeBox);
  }

  function addMatchingListings(matchAttemptNum, ret, brandname, productname, match_found) {
    console.log('addMatchingListings');
      var column1 = l.getElementById("easystreet_column1");
      var column2 = l.getElementById("easystreet_column2");

      if (column1 && column2) {
          removeAllChildren(column1);
          removeAllChildren(column2);
      }

      var currentColumn = column1;

      var listingNums = document.createElement("p");
      listingNums.innerText = ret.length === 1 ? ret.length + " Listing Found" : ret.length + " Similar Listings Found";
      var listNumLocation = l.getElementById("easystreet_listingNum");

      if (!listNumLocation.querySelector("p")) {
          listNumLocation.appendChild(listingNums);
      }

      for (var m = 0; m < ret.length; m++) {
          var listing = document.createElement("div");
          listing.classList.add("easystreet_listing");

          var img = document.createElement("img");
          img.classList.add("prodlistingimg");
          if (ret[m].image_image) {
              img.src = ret[m].image_image;
              img.alt = ret[m].name_text;
          } else {
              img.src = chrome.runtime.getURL("assets/noimage.jpg");
              img.alt = "No image available icon";
          }
          img.alt = "Product listing #" + m;

          var listingInfo = document.createElement("div");
          listingInfo.classList.add("easystreet_listing-info");

          var itemName = document.createElement("p");
          itemName.innerText = ret[m].name_text;
          itemName.classList.add("itemnameESContent");

          var marketplace = document.createElement("p");
          marketplace.innerText = (ret[m].marketplace_text).toUpperCase();
          marketplace.classList.add("marketplaceESContent");

          var firstSplitDiv = document.createElement("div");
          firstSplitDiv.classList.add("easystreet_splitDiv");

          var color = document.createElement("p");
          color.innerText = (ret[m].color_text).toTitleCase();
          color.classList.add("leftAlignESContent");

          var size = document.createElement("p");
          if (ret[m].size_text) {
              if (Array.isArray(ret[m].size_text)) {
                  // If size_text is an array, use 'various'
                  size.innerText = 'Various';
              } else if ((ret[m].size_text).match(/^[0-9]+$/) != null) {
                  size.innerText = ret[m].size_text;
              } else {
                  if (ret[m].size_text == "not specified" || ret[m].size_text.toLowerCase() == "various") {
                      size.innerText = (ret[m].size_text).toTitleCase();
                  } else {
                      size.innerText = (ret[m].size_text).toUpperCase();
                  }
              }
          }
          size.classList.add("rightAlignESContent");
          size.classList.add("grayTextESContent");

          var secondSplitDiv = document.createElement("div");
          secondSplitDiv.classList.add("easystreet_splitDiv");

          var price = document.createElement("p");
          price.innerText = "$" + formatPrice(JSON.stringify(ret[m].price_number));
          price.classList.add("leftAlignESContent");
          price.classList.add("grayTextESContent");

          var condition = document.createElement("p");
          condition.innerText = (ret[m].condition_text).toUpperCase();
          if (match_found) {
              condition.classList.add("rightAlignESContent");
          } else {
              condition.classList.add("marketplaceESContent");
          }

          listingInfo.appendChild(itemName);
          firstSplitDiv.appendChild(marketplace);

          if (match_found) {
              firstSplitDiv.appendChild(color);
              firstSplitDiv.appendChild(size);
              secondSplitDiv.appendChild(price);
              secondSplitDiv.appendChild(condition);
          } else {
              firstSplitDiv.appendChild(condition);
              secondSplitDiv.appendChild(price);
              secondSplitDiv.appendChild(size);
          }

          var formattingHR = document.createElement("div");
          formattingHR.classList.add("formattingAlignESContent");

          var link = document.createElement("a");
          link.setAttribute("target", "_blank");
          link.href = ret[m].link_text;

          listingInfo.appendChild(formattingHR);
          listingInfo.appendChild(firstSplitDiv);
          listingInfo.appendChild(secondSplitDiv);
          listingInfo.appendChild(formattingHR);
          listing.appendChild(img);
          listing.appendChild(listingInfo);
          link.appendChild(listing);

          currentColumn.appendChild(link);
          currentColumn = (currentColumn === column1) ? column2 : column1;

          listing.addEventListener('click', () => {
              (async () => {
                  let urlshort = (document.location.href).split('.com')[0] + '.com';
                  const response = await chrome.runtime.sendMessage({
                      greeting: "listingClick",
                      matchid: matchAttemptNum,
                      brand: brandname,
                      product: productname,
                      market: marketplace.innerText,
                      url: urlshort,
                      listingNums: listingNumsCount
                  });
              })();
          })
      }
      A.addEventListener("click", () => {
          g.style.display = "flex";
          g.classList.add("show");
          g.classList.add("active");
          A.style.display = "none";

          (async () => {
              let urlshort = (document.location.href).split('.com')[0] + '.com';
              const response = await chrome.runtime.sendMessage({
                  greeting: "buttonClick",
                  matchid: matchAttemptNum,
                  brand: brandname,
                  product: productname,
                  url: urlshort,
                  listingNums: listingNumsCount
              });
          })();
      });
      A.style.display = "flex";
      l.getElementById("status").style.display = "none";
      flashButton(A);
  }

  function resetPage() {
    console.log('resetPage');
      const elements = document.getElementsByClassName("easystreet_listing");
      while (elements.length > 0) {
          elements[0].parentNode.removeChild(elements[0]);
      }
  }

  function standardizedEAccent(brand) {
    console.log('standardizedEAccent');
      return brand.normalize('NFD').replace(/é/g, 'e').replace(/[\u0300-\u036f]/g, '');
  }

  function formatPrice(price) {
    console.log('formatPrice');
      var res = Math.round(price.replace(/[^0-9.]/g, ''));
      return res;
  }

  function sortProducts(matchAttemptNum, sortOption, brand, product, match_found) {
    console.log('sortProducts');
      switch (sortOption) {
          case 'price-low-to-high':
              matches = matches.sort((a, b) => a.price_number - b.price_number);
              filteredMatches = filteredMatches.sort((a, b) => a.price_number - b.price_number);
              break;
          case 'price-high-to-low':
              matches = matches.sort((a, b) => b.price_number - a.price_number);
              filteredMatches = filteredMatches.sort((a, b) => b.price_number - a.price_number);
              break;
          case 'relevance':
              matches = matches.sort((a, b) => b.best_match_score_number - a.best_match_score_number);
              filteredMatches = filteredMatches.sort((a, b) => b.best_match_score_number - a.best_match_score_number);
              break;
          default:
              matches = matches.sort((a, b) => b.best_match_score_number - a.best_match_score_number);
              filteredMatches = filteredMatches.sort((a, b) => b.best_match_score_number - a.best_match_score_number);
              break;
      }
      addMatchingListings(matchAttemptNum, filteredMatches, brand, product, match_found);
  }


  var appliedFilters = {
      Size: [],
      Marketplace: [],
      Condition: [],
      Color: []
  };

  function filterProducts(filterRequest, type, remove, matchAttemptNum, brand, product, match_found) {
      if (remove) {
          appliedFilters[type] = appliedFilters[type].filter(function(filter) {
              return filter.filterRequest !== filterRequest;
          });
      } else {
          appliedFilters[type].push({
              filterRequest: filterRequest,
              type: type
          });
      }

      filteredMatches = matches;

      Object.keys(appliedFilters).forEach(function(category) {
          var categoryFilters = appliedFilters[category];
          if (categoryFilters.length > 0) {
              filteredMatches = filteredMatches.filter(function(match) {
                  return categoryFilters.some(function(filter) {
                      var matchValue = match[category.toLowerCase() + '_text'];
                      if (Array.isArray(matchValue)) {
                          return matchValue.some(value => value.toLowerCase() === filter.filterRequest.toLowerCase());
                      } else if (typeof matchValue === 'string') {
                          return matchValue.toLowerCase() === filter.filterRequest.toLowerCase();
                      }
                      return false;
                  });
              });
          }
      });
      addMatchingListings(matchAttemptNum, filteredMatches, brand, product, match_found);
  }

  function removeAllChildren(element) {
    console.log('removeAllChildren');
      while (element.firstChild) {
          removeAllChildren(element.firstChild);
          element.removeChild(element.firstChild);
      }
  }

  function isImage(url) {
    console.log('isImage');
      return new Promise((resolve) => {
          const img = new Image();
          img.onload = function() {
              resolve(true);
          };
          img.onerror = function() {
              resolve(false);
          };
          img.src = url;
      });
  }

  String.prototype.toTitleCase = function() {
      return this.toLowerCase().split(" ").map((word) => {
          const lowerWords = ['a', 'an', 'and', 'the', 'in', 'of'];
          if (lowerWords.includes(word)) return word;
          return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(" ");
  };

  let lastUrl = document.location.href;

  new MutationObserver(() => {
      const url = document.location.href;
      if (url !== lastUrl) {
          lastUrl = url;
          onUrlChange();
      }
  }).observe(document.body, {
      childList: true,
      subtree: true
  });

  function onUrlChange() {
    console.log('onUrlChange');
      A.style.display = "none";
      g.style.display = "none";
      resetPage();
      const container = l.getElementById("easystreet_container");
      const pricerangeinfo = l.getElementById("pricerangebox");
      const otherboxes = l.getElementById("easystreet_maininfobottomdiv");
      const filterbutton = l.getElementById("easystreet_filter-button");
      const filterdivElem = l.getElementById("easystreet_filterDiv");
      const filterOptionsElems = l.getElementById("easystreet_filters");
      const pricingbar = document.getElementsByClassName("easystreet_priceCard");
      if (container) {
          container.remove();
      }
      if (pricerangeinfo) {
          pricerangeinfo.remove();
      }
      if (otherboxes) {
          otherboxes.remove();
      }
      if (filterbutton) {
          filterbutton.remove();
      }
      if (filterdivElem) {
          filterdivElem.remove();
      }
      if (filterOptionsElems) {
          filterOptionsElems.remove();
      }
      if (pricingbar.length > 0) {
          var thisPriceBar = pricingbar[0];
          thisPriceBar.remove();
      }
      fetchJsonLD(document.location.href);
  }

  function generateUUID() {
    console.log('generateUUID');
      var d = new Date().getTime();
      if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
          d += performance.now();
      }
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
  }

  function flashButton(button) {
    console.log('flashButton');
      button.classList.add('easystreet_flash-button');
      setTimeout(() => {
          button.classList.remove('easystreet_flash-button');
      }, 3000);
  }

  resetPage();
  fetchJsonLD(document.location.href);
}

export default ContentScript;