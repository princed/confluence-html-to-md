#!/usr/bin/env node

var cheerio = require('cheerio');
var md = require('html-md');
var fs = require('fs');
var argv = require('yargs').argv;

var imagePrefixRE = /(!\[]\()attachments/g;
var htmlExtesionRE = /\.html?$/;

function filterFileHtml(name) {
	return htmlExtesionRE.test(name);
}

function convertHtml(file) {
	var html = cheerio.load(file);
	
	var content = html('.pagebody');
	content.find('.pageheader').remove();
	content.find('.pagesubheading').remove();

	var attachments = content.find('a[name=attachments]').parent();
	attachments.next().remove();
	attachments.remove();
	
	var title = html('title').text();

	if (argv.titleClean) {
		title = title.replace(argv.titleClean, '');
	}
	
	var markdown = md(content.html(), {
		inline: true
	});
	
	markdown = '---\n' +
						 'title: ' + title +  '\n' +
						 '---\n' +
						 '# ' + title + '\n' + 
	           markdown;
	
	if (argv.attachmentsPath) {
		return markdown.replace(imagePrefixRE, function(match, prefix) {
		  return prefix + argv.attachmentsPath;
		});
	}

	return markdown;	
}

function convertFile(name) {
	console.log('Converting file', name);
	
	var file = fs.readFileSync(name);
	var mdContent = convertHtml(file);
	var mdName = name.replace(htmlExtesionRE, '.md');
	
	fs.writeFileSync(mdName, mdContent);
	console.log('File', mdName, 'written');
}

fs.readdirSync(process.cwd())
	.filter(filterFileHtml)
	.forEach(convertFile);
