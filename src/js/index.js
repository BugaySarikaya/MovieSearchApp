window.$ = window.jQuery = require('jquery');
window.Popper = require('popper.js');
require('bootstrap');

import '../sass/index.scss';

// variables

var url = 'http://www.omdbapi.com/?apikey=e05de85&';
var timeoutId = 0;
var lastSearchText = '';

// functions

/**
 *Input debounce function, fetches search results
 */

var getFilteredResultCount = function () {
    $('#searchIcon').hide();
    $('#arrowIcon').show();
    clearAutoCompete();
    var inputVal = $('#searchText').val();
    if (inputVal !== null && inputVal.length > 2) {
        getMovie($('#searchText').val(), 2, function (results) {
            for (var i = 0; i < results.length; i++) {
                addAutoComplete(results[i]);
            }
            addShowMore();
            $('#auto-complete').show();
        });
    } else {
        $('#searchIcon').show();
        $('#arrowIcon').hide();
    }
};

/**
 * Clear search results
 */

var clearAutoCompete = function () {
    $('#auto-complete').hide();
    document.getElementById('auto-complete').innerHTML = '';
};

/**
 * Show more button
 */

var addShowMore = function () {
    var showMore = document.createElement("span");
    showMore.id = 'sonuc';
    showMore.innerHTML = 'Daha Fazla Sonuç >>';
    document.getElementById('auto-complete').appendChild(showMore);
    $("#sonuc").click(function () {
        window.location.href = '/all.html?search=' + lastSearchText;
    });
};

/**
 * Scroll top button
 */

var addReturnTop = function () {
    var showMore = document.createElement("span");
    showMore.id = 'bas';
    showMore.innerHTML = 'BAŞA DÖN';
    document.getElementById('auto-complete').appendChild(showMore);
    $("#bas").click(function () {
        $('html,body').animate({scrollTop: 0}, 500);
    });
}

/**
 * Filling autocomplete interface
 * @param movieDetail1
 * @param movieDetail2
 */

var addAutoComplete = function (movieDetail1, movieDetail2) {
    var rowRoot = document.createElement("div");
    rowRoot.className = 'row flex-nowrap fixRow';

    var addMovieDeail = function (movieDetail) {
        var row = document.createElement("div");
        row.className = 'row firstColumn';
        var colSm = document.createElement("div");
        colSm.className = 'col-sm';
        row.appendChild(colSm);
        var img = document.createElement("img");
        img.id = 'movieImage';
        img.src = movieDetail.Poster;
        colSm.appendChild(img);
        var info = document.createElement("div");
        info.className = 'col-sm';
        info.id = 'info';
        row.appendChild(info);
        var pTitle = document.createElement("p");
        pTitle.id = 'title';
        pTitle.innerHTML = movieDetail.Title;
        info.appendChild(pTitle);
        var pRate = document.createElement("p");
        pRate.id = 'rate';
        pRate.innerHTML = '<img class="star" src="/assets/star-64.png"><span style="color: #2196F3; font-size: 24px;"> '
            + movieDetail.imdbRating + '</span>\/10';
        info.appendChild(pRate);
        var pLanguage = document.createElement("p");
        pLanguage.id = 'language';
        pLanguage.innerHTML = '<b>Dil: </b>' + movieDetail.Language;
        info.appendChild(pLanguage);
        var pActors = document.createElement("p");
        pActors.id = 'actors';
        pActors.innerHTML = '<b>Oyuncular: </b>' + movieDetail.Actors;
        info.appendChild(pActors);
        var pPlot = document.createElement("p");
        pPlot.id = 'plot';
        pPlot.innerHTML = movieDetail.Plot;
        info.appendChild(pPlot);
        return row;
    };
    if (movieDetail1) {
        rowRoot.appendChild(addMovieDeail(movieDetail1));
    }
    if (movieDetail2) {
        rowRoot.appendChild(addMovieDeail(movieDetail2));
    }
    document.getElementById('auto-complete').appendChild(rowRoot);
};

/**
 * Fetches each movie details from api response
 * @param searchText
 * @param limit
 * @param callback
 */

var getMovie = function (searchText, limit, callback) {
    lastSearchText = searchText;
    searchMovie(searchText)
        .then(function (searchResults) {
            if (searchResults) {
                console.log({searchResults});
                if (limit > 0) {
                    searchResults = searchResults.slice(0, limit);
                }
                var promisses = searchResults.map(function (e) {
                    return getMovieDetail(e.imdbID);
                });
                Promise.all(promisses)
                    .then(function (movieDetails) {
                        callback(movieDetails);
                    })
                    .catch(function (err) {
                        console.log(err);
                        // alert(err);
                    });
            } else {
                callback([]);
            }
        })
        .catch(function (err) {
            console.log(err);
            // alert(err);
        });
};

/**
 * Get movie's details from api
 * @param imdbID
 * @returns {Promise<any>}
 */

var getMovieDetail = function (imdbID) {
    return new Promise(function (resolve, reject) {
        $.ajax(url + 'plot=short&i=' + imdbID, {
            type: "GET",
            dataType: "json",
            success: function (response) {
                resolve(response);
            },
            error: function (err) {
                $('#searchIcon').show();
                $('#arrowIcon').hide();
                reject(err);
            }
        })
    });
};

/**
 * Search movies api
 * @param searchText
 * @returns {Promise<any>}
 */

var searchMovie = function (searchText) {
    return new Promise(function (resolve, reject) {
        $.ajax(url + 's=' + searchText, {
            type: "GET",
            dataType: "json",
            success: function (response) {
                resolve(response.Search);
            },
            error: function (err) {
                $('#searchIcon').show();
                $('#arrowIcon').hide();
                reject(err);
            }
        });
    });
};

/**
 * Query parameter parser
 */

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


/**
 * App entry point
 */

$(document).ready(function () {
    var searchText = getParameterByName('search');
    if (searchText) {
        getMovie(searchText, -1, function (results) {
            for (var i = 0; i < results.length; i += 2) {
                addAutoComplete(results[i], (i + 1 < results.length ? results[i + 1] : null));
            }
            $('#auto-complete').show();
            $('#allSearchText').html(searchText + ' için sonuçlar');
            $('#allSearchValue').html(results.length + ' film bulundu');
            addReturnTop();
        });
    } else {
        $('#searchText').on('change keydown paste input', function () {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(getFilteredResultCount, 500);
        });
    }
});

window.lastSearchText = lastSearchText;

