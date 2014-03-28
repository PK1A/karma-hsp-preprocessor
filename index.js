var path = require('path');

var createHspPreprocessor = function (args, config, logger, helper) {

    // Try to look up compiler from the local installation path in order to use the source
    // of the compiler when testing hsp itself. It is a bit hackish but don't know of a
    // better approach for now...
    var localHspPath = path.normalize(__dirname + '/../../hsp/compiler/compiler.js');
    var compiler = fs.existsSync(localHspPath) ? require(localHspPath) : require('hashspace').compiler;

    var log = logger.create('preprocessor.hsp');

    return function (content, file, done) {

        log.debug('Processing "%s".', file.originalPath);
        var compileResult = compiler.compile(content, file.path);

        //TODO: refactor as soon as https://github.com/ariatemplates/hashspace/issues/61 is fixed
        if (compileResult.errors.length  === 0) {
            if (path.extname(file.path) === '.hsp') {
                file.path = file.path + '.js';
            }
            done(compileResult.code);
        } else {
            compileResult.errors.forEach(function(error){
                log.error('%s\n in %s at %d:%d', error.description, file.originalPath, error.line, error.column);
            });
            done(new Error(compileResult.errors));
        }
    };
};

// PUBLISH DI MODULE
module.exports = {
    'preprocessor:hsp': ['factory', createHspPreprocessor]
};