// Run fetchNews when the page loads with default category "world"
window.addEventListener("load", () => fetchNews("world"));


// Fetch news data from backend API based on query
async function fetchNews(query) {
    // Call backend route with query parameter
    const res = await fetch(`/api/news?q=${query}`);
    
    // Convert response to JSON
    const data = await res.json();
    
    // Pass articles array to UI rendering function
    bindData(data.articles);
}


// Bind (render) fetched articles into HTML cards
function bindData(articles) {
    // Get container where cards will be displayed
    const cardsContainer = document.getElementById("cards-container");
    
    // Get template for news card
    const newsCardTemplate = document.getElementById("template-news-card");

    // Clear existing cards before adding new ones
    cardsContainer.innerHTML = "";

    // Loop through each article
    articles.forEach((article) => {
        // Skip articles without images
        if (!article.urlToImage) return;

        // Clone template content
        const cardClone = newsCardTemplate.content.cloneNode(true);
        
        // Fill data into cloned card
        fillDataInCard(cardClone, article);
        
        // Append card to container
        cardsContainer.appendChild(cardClone);
    });
}


// Fill individual article data into a card template
function fillDataInCard(cardClone, article) {
    // Select elements inside the card
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");

    // Assign article data to elements
    newsImg.src = article.urlToImage;
    newsTitle.innerHTML = article.title;
    newsDesc.innerHTML = article.description;

    // Format published date to readable format
    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
    });

    // Display source name and formatted date
    newsSource.innerHTML = `${article.source.name} · ${date}`;

    // Open article in new tab when card is clicked
    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });
}


// Track currently selected navigation item
let curSelectedNav = null;


// Handle navigation item click (category switching)
function onNavItemClick(id) {
    // Fetch news based on selected category
    fetchNews(id);

    // Get clicked nav element
    const navItem = document.getElementById(id);

    // Remove active class from previous selection
    curSelectedNav?.classList.remove("active");

    // Update current selection
    curSelectedNav = navItem;

    // Add active class to new selection
    curSelectedNav.classList.add("active");
}


// Get search input and button elements
const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");


// Handle search button click
searchButton.addEventListener("click", () => {
    // Get user input value
    const query = searchText.value;

    // Prevent empty search
    if (!query) return;

    // Fetch news based on search query
    fetchNews(query);

    // Remove active nav selection when searching
    curSelectedNav?.classList.remove("active");
    curSelectedNav = null;
});


// Dark mode toggle button
const darkToggle = document.getElementById("dark-toggle");


// Toggle dark/light theme
darkToggle.addEventListener("click", () => {
    // Toggle dark class on body
    document.body.classList.toggle("dark");

    // Get icon inside toggle button
    const icon = darkToggle.querySelector("img");

    // Update icon and save preference in localStorage
    if (document.body.classList.contains("dark")) {
        icon.src = "./assets/sun.png";
        localStorage.setItem("theme", "dark");
    } else {
        icon.src = "./assets/moon.png";
        localStorage.setItem("theme", "light");
    }
});


// Apply saved theme on page load
window.onload = () => {
    const theme = localStorage.getItem("theme");

    // If dark mode was previously selected, apply it
    if (theme === "dark") {
        document.body.classList.add("dark");
    }
};