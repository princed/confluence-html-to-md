#!/usr/bin/env node

var cheerio = require('cheerio');
var md = require('html-md');
var fs = require('fs');

var htmlExtesionRE = /\.html?$/;

function filterFileHtml(name) {
	return htmlExtesionRE.test(name);
}

function convertFile(name) {
	var file = fs.readFileSync(name);
	var html = cheerio.load(file)('.pagebody').html(); 	
	var mdName = name.replace(htmlExtesionRE, '.md');
	var mdContent = md(html);
	
	fs.writeFileSync(mdName, mdContent);
}

fs.readdirSync(__dirname)
	.filter(filterFileHtml)
	.forEach(convertFile);
