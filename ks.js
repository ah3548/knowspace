var express = require('express');
var wiki = require('./ks-wiki');
var so = require('./ks-so');
var orm = require('./ks-orm');
var app = express();


//var Faker = require('faker');
//var randomName = Faker.Name.findName(); // Rowan Nikolaus containing many properties


var subject = "Linear_algebra";

app.use(express.static('.'));


function getWikiFromDB(subject) {
    return orm.getWikiEntry(subject).then(
        function(content) {
            return content;
        }
    ).catch(
        function(error) {
            console.log("Wikipedia Entry not found, fetching now..");
            return getWiki(subject).then(
                function(content) {
                    return content;
                }
            );
        }
    );
}

function getWiki(subject) {
    return wiki.getWikiEntry(subject).then(
        function(content) {
            return orm.createWikiEntry( 
            {subject:subject, content:content});
        }
    );
}

function getQuestionsFromDB(subject) {
    return orm.getWikiEntry(subject).then(
        function(content) {
            return content;
        }
    ).catch(
        function(error) {
            console.log("Stack Overflow Question not found, fetching now..");
            return getWiki(subject).then(
                function(content) {
                    return content;
                }
            );
        }
    );
}

function insertQuestionsIntoDB(questions) {
    for (var i = 0; i < questions.length; i++) {
        insertQuestionPromise(questions[i]).then(function() {
            console.log("Insert Complete");
        });
    }
}

function insertQuestionPromise(question) {
    return new Promise(function(resolve, reject) {
        var id = question.question_id;
        orm.getQuestion(id).then(function(body) {
            console.log("Question " + id + " found");
            return body;
        }).catch (
            function(error) {
                console.log(error);
                question.tags = JSON.stringify(question.tags);
                orm.insertQuestion(question);
            }
        );
        resolve();

    })
}

function getQuestions(subject) {
    return so.getQuestions(subject).then(function(resolve, reject) {
        insertQuestionsIntoDB(resolve) 
        return resolve;
    });
    /*return wiki.getWikiEntry(subject).then(
        function(content) {
            return orm.createWikiEntry( 
            {subject:subject, content:content});
        }
    );*/
}

getQuestions(subject).then(function(resolve) {
    console.log(resolve);
});


app.get('/wiki', function (req, res) {
    getWikiFromDB(subject).then(
        function(content) {
            res.send(content);
        }
    );
});

app.listen(3000, function () {
  console.log('Listening on port 3000!');
});
