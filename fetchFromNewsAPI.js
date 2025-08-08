// Replace the existing fetchFromNewsAPI function with this:
async function fetchFromBackend(endpoint, params = {}) {
    const url = new URL(`http://localhost:5000/api/${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching from backend:', error);
        return null;
    }
}

// Update the loadFeaturedArticle function:
async function loadFeaturedArticle() {
    try {
        const data = await fetchFromBackend('news', { limit: 1 });
        if (data && data.news && data.news.length > 0) {
            const article = data.news[0];
            featuredArticle.innerHTML = `
                <img src="${article.urlToImage || 'https://picsum.photos/seed/featured/800/450.jpg'}" alt="${article.title}">
                <div class="featured-article-content">
                    <div class="article-category">${article.category || 'General'}</div>
                    <h2>${article.title}</h2>
                    <div class="article-meta">
                        <span><i class="far fa-clock"></i> ${formatDate(article.publishedAt)}</span>
                        <span><i class="far fa-user"></i> ${article.source.name}</span>
                        <span><i class="far fa-comment"></i> ${Math.floor(Math.random() * 100)} comments</span>
                    </div>
                    <p>${article.description || 'No description available.'}</p>
                    <a href="${article.url}" target="_blank" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
                    ${article.source.name ? `<div class="source-attribution">Source: ${article.source.name}</div>` : ''}
                </div>
            `;
        } else {
            // Fallback to sample data
            featuredArticle.innerHTML = `
                <img src="https://picsum.photos/seed/featured/800/450.jpg" alt="Featured Article">
                <div class="featured-article-content">
                    <div class="article-category">Technology</div>
                    <h2>Automated News Systems Transforming Digital Media</h2>
                    <div class="article-meta">
                        <span><i class="far fa-clock"></i> 2 hours ago</span>
                        <span><i class="far fa-user"></i> AutoNews System</span>
                        <span><i class="far fa-comment"></i> 24 comments</span>
                    </div>
                    <p>Advanced automation technologies are revolutionizing how news is gathered, processed, and delivered to audiences worldwide.</p>
                    <a href="#" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading featured article:', error);
        showError();
    }
}

// Update the loadArticles function:
async function loadArticles() {
    try {
        const data = await fetchFromBackend('news', { limit: 6 });
        if (data && data.news) {
            renderArticles(data.news);
        } else {
            const sampleArticles = generateSampleArticles(6);
            renderArticles(sampleArticles);
        }
    } catch (error) {
        console.error('Error loading articles:', error);
        showError();
    }
}

// Update the loadTrendingTopics function:
async function loadTrendingTopics() {
    try {
        const trending = await fetchFromBackend('trending');
        if (trending) {
            renderTrendingTopics(trending);
        } else {
            const sampleTrending = generateSampleTrending();
            renderTrendingTopics(sampleTrending);
        }
    } catch (error) {
        console.error('Error loading trending topics:', error);
        showError();
    }
}

// Update the loadBreakingNews function:
async function loadBreakingNews() {
    try {
        const breaking = await fetchFromBackend('breaking');
        if (breaking) {
            updateBreakingNewsTicker(breaking);
        } else {
            updateBreakingNewsTicker(null);
        }
    } catch (error) {
        console.error('Error loading breaking news:', error);
        updateBreakingNewsTicker(null);
    }
}
