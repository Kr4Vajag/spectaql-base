"use strict";



module.exports = function (phrase, _options) {

  var match = /\w+/.exec(phrase);
  if (match) var word = match[0];else
  return 'an';

  var l_word = word.toLowerCase();

  var alt_cases = ['honest', 'hour', 'hono'];
  for (var i in alt_cases) {
    if (l_word.indexOf(alt_cases[i]) == 0) return 'an';
  }


  if (l_word.length == 1) {
    if ('aedhilmnorsx'.indexOf(l_word) >= 0) return 'an';else
    return 'a';
  }


  if (
  word.match(
    /(?!FJO|[HLMNS]Y.|RY[EO]|SQU|(F[LR]?|[HL]|MN?|N|RH?|S[CHKLMNPTVW]?|X(YL)?)[AEIOU])[FHLMNRSX][A-Z]/
  ))
  {
    return 'an';
  }


  const regexes = [
  /^e[uw]/,
  /^onc?e\b/,
  /^uni([^nmd]|mo)/,
  /^u[bcfhjkqrst][aeiou]/];

  for (var regex in regexes) {
    if (l_word.match(regexes[regex])) return 'a';
  }


  if (word.match(/^U[NK][AIEO]/)) {
    return 'a';
  } else if (word == word.toUpperCase()) {
    if ('aedhilmnorsx'.indexOf(l_word[0]) >= 0) return 'an';else
    return 'a';
  }


  if ('aeiou'.indexOf(l_word[0]) >= 0) return 'an';


  if (l_word.match(/^y(b[lor]|cl[ea]|fere|gg|p[ios]|rou|tt)/)) return 'an';

  return 'a';
};