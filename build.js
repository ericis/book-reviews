#!/usr/bin/env node

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const allPaths = fs.readdirSync('./');

const bookReviews = [];

allPaths.forEach((somePath) => {

    // console.log('somePath', somePath);

    const readmeFilePath = path.join(somePath, './README.adoc');
    const indexFilePath = path.join(somePath, './index.html');

    if (fs.existsSync(readmeFilePath)) {

        const readmeContent = fs.readFileSync(readmeFilePath, { encoding: 'utf8' });

        const lines = readmeContent.split('\n');

        const title = (lines[0].length > 0 ? lines[0].substr(2) : lines[1].substr(2)).trim();

        bookReviews.push({
            path: somePath,
            title,
        });

        console.log(title);
        console.log('Converting AsciiDoc to HTML...', somePath);

        const cmd = 'asciidoctor';
        const argv = ['-o', indexFilePath, readmeFilePath];

        const formattedCommand = cmd + ' ' + argv.join(' ');

        // execSync(formattedCommand, { stdio: 'inherit' });
    }
});

const bookReviewMarkdownListLinks = bookReviews
    .sort((a, b) => {
        return a.title - b.title;
    })
    .map((bookReview) => {
        return `* [${bookReview.title}](./${bookReview.path}/)`;
    });

// console.log(bookReviewMarkdownListLinks);

console.log('Generating list of book reviews...');

const readmeFilePath = './README.md';

const readmeContent = fs.readFileSync(readmeFilePath, { encoding: 'utf8' });

const readmeBookReviewsStartTag = '<!--book-reviews:begin-->';
const readmeBookReviewsEndTag = '<!--book-reviews:end-->';
const readmeCurrentBookReviewsStartIx = readmeContent.indexOf(readmeBookReviewsStartTag);
const readmeCurrentBookReviewsEndIx = readmeContent.indexOf(readmeBookReviewsEndTag, readmeCurrentBookReviewsStartIx) + readmeBookReviewsEndTag.length;

const readmeCurrentBookReviews = readmeContent.substr(readmeCurrentBookReviewsStartIx, readmeCurrentBookReviewsEndIx - readmeCurrentBookReviewsStartIx);

// console.log('');
// console.log('Current reviews:');
// console.log(readmeCurrentBookReviews);

const readmeNewBookReviews = `${readmeBookReviewsStartTag}
${bookReviewMarkdownListLinks.join('\n')}
${readmeBookReviewsEndTag}`;

// console.log('');
// console.log('New reviews:');
// console.log(readmeNewBookReviews);

const readmeNewContent = readmeContent.replace(readmeCurrentBookReviews, readmeNewBookReviews);

fs.writeFileSync(readmeFilePath, readmeNewContent, { encoding: 'utf8' });

console.log('Book reviews successfully generated!');
