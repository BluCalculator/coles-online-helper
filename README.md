
current incarnation is a greasemonkey userscript, but eventually i aim to diverge it into a firefox extension, and then mayyyyyyybe if anyone wants to use it, a chrome extension. will remain open source regardless.
no ai was used in the creation of this project, at any stage.

### working so far:
- read ingredients
- annotate product pages that have the blacklisted ingredients
- highlight links to products that have the blacklisted ingredients

### how it works:
- modify script's config to add blacklisted ingredients, it will display these up the top of the page
  - (comma separated list inside the array's square brackets [], like ["asdf","qwer","zxcv"])
- will scan any `http://www.coles.com.au/*product*` page that you open, look for the Ingredients section (by elementID) for all ingredients in the blacklist, if it works it will prefix the productname header to mention the ingredient(s)
  - it will also add that URL to The URL Blacklist
- if any links (a href) on a non-product page point to The URL Blacklist then it will highlight the link and its parent elements with the "negative highlight style" which is also in configs - it's basically css

### to be implemented:
- remember why we blacklist the URL
  - indicate blacklist reason in results?
- store more nuanced and more useful information from blacklists. (not sure how far to go with this)
  - if blacklisted ingredients list changes, url blacklist should change too.

### ideas
- actually, i should probably display my header and do the highlighting on any page that has products on it, not "any page"
  - only to product, search results, bought-before, homepage?
  - all except in account settings?
  - all?
- highlight checked/unchecked? don't want false confidence that something's free of blacklistees.
