'use strict';
const wordCourseGames=[
 ['Everyday things','nouns',['cup','spoon','bowl'],'Teach familiar object names.'],
 ['Getting dressed','nouns',['shoe','coat','hat'],'Connect clothing words with pictures.'],
 ['Food words','nouns',['apple','carrot','banana'],'Connect familiar food words with pictures.'],
 ['Playtime words','nouns',['ball','car','blocks'],'Learn words for play materials.'],
 ['Things that help','nouns',['brush','wateringcan','cloth'],'Name familiar tools and materials.'],
 ['Full or empty?','full',[],'Understand contrasting amounts.'],
 ['Big and small','size',[],'Understand a size contrast.'],
 ['Wet and dry','wet',[],'Understand a visible property.'],
 ['Open and closed','open',[],'Understand an object’s state.'],
 ['One and more','quantity',[],'Understand one versus several.'],
 ['Pour, wash, brush','actions',['pour','wash','brush'],'Connect action words with events.'],
 ['Push, pull, carry','actions',['push','pull','carry'],'Distinguish actions involving movement.'],
 ['Sleep, sit, jump','actions',['sleep','sit','jump'],'Connect an action word with a character.'],
 ['What is it for?','function',[],'Understand words in descriptions of uses.'],
 ['Useful partners','partners',[],'Understand relationships between named objects.'],
 ['Which group?','category',[],'Understand a familiar category word.'],
 ['Describe the shape','shape',[],'Understand shape words in context.'],
 ['Listen for “not”','negative',[],'Understand a simple negative description.'],
 ['A new example','newexample',[],'Apply familiar names to a changed drawing.'],
 ['Two clues together','attributes',[],'Combine size and amount in a description.']
].map(([title,mode,items,skill])=>({title,mode,items,skill,object:items[0]&&['pour','wash','brush','push','pull','carry','sleep','sit','jump'].includes(items[0])?'cup':items[0]||'cup',exercise:'Use two or three familiar real objects. Name or describe them in the child’s accessible language, then invite a choice. Later try a new example.'}));
const sentenceCourseGames=[
 ['What is teddy doing?','verb','Understand an action in a short sentence.'],
 ['Who is jumping?','subject','Attend to the person or animal doing an action.'],
 ['What is being pushed?','object','Attend to the object of an action.'],
 ['Who chases whom?','chase','Distinguish reversed actor and receiver roles.'],
 ['Who follows whom?','follow','Track who follows and who leads.'],
 ['Giving a ball','give','Understand giver and receiver.'],
 ['Who washes whom?','wash','Distinguish roles in a reversible sentence.'],
 ['Who brushes whom?','brush','Attend to both characters in a sentence.'],
 ['In, on, under','position','Understand a spatial relationship.'],
 ['Beside or behind?','treeposition','Understand position relative to a tree.'],
 ['Around the chair','chairposition','Apply position words with a different object.'],
 ['One—or more than one?','plural','Understand singular and plural in a sentence.'],
 ['Two little clues','attributes','Combine two attributes in one description.'],
 ['Holding or not holding','negative','Understand a sentence with “not.”'],
 ['Pushing or pulling','pushpull','Distinguish two related actions.'],
 ['Who gives what?','giveobject','Track the characters and the transferred object.'],
 ['First this, then that','instructions','Follow a two-part language instruction.'],
 ['Before and after','beforeafter','Connect sentence order with event order.'],
 ['Understanding “because”','because','Connect a stated reason with a picture.'],
 ['Sentence explorers','review','Revisit actor, position, and negation contrasts.']
].map(([title,mode,skill])=>({title,mode,skill,object:mode==='position'?'box':'book',exercise:'Act out one short sentence with toys or objects. Reverse the roles or change one word, then demonstrate how the meaning changes. Use the child’s accessible language.'}));
const soundCourseGames=[
 ['Clap a little word','syllables',[['apple',2,'ap · ple'],['basket',2,'bas · ket'],['umbrella',3,'um · brel · la']],'Notice syllables in familiar spoken words.'],
 ['One little clap','syllables',[['cup',1,'cup'],['hat',1,'hat'],['ball',1,'ball']],'Notice words with one syllable.'],
 ['Two little claps','syllables',[['apple',2,'ap · ple'],['carrot',2,'car · rot'],['basket',2,'bas · ket']],'Separate two-syllable words.'],
 ['Three little claps','syllables',[['banana',3,'ba · na · na'],['umbrella',3,'um · brel · la'],['tomato',3,'to · ma · to']],'Separate three-syllable words.'],
 ['Put word parts together','syllableblend',[['apple','ap · ple'],['basket','bas · ket'],['umbrella','um · brel · la']],'Blend spoken syllables into a word.'],
 ['Find a one-beat word','syllablechoice',[['cup','apple','umbrella'],['hat','carrot','banana'],['ball','basket','tomato']],'Compare syllable lengths.'],
 ['Rhyme partners','rhyme',[['cat','hat','dog','cup'],['boat','goat','cat','ball'],['dog','log','shoe','cup']],'Notice matching word endings.'],
 ['A rhyme that wandered away','rhymeodd',[['cat','hat','cup'],['dog','log','shoe'],['boat','goat','sun']],'Notice which ending does not match.'],
 ['Do they rhyme?','rhymeyes',[['cat','hat',true],['boat','cup',false],['dog','log',true]],'Judge a pair of familiar word endings.'],
 ['I spy a sound','initial',[['sun','/s/'],['moon','/m/'],['ball','/b/']],'Connect an initial speech sound with a word.'],
 ['More first sounds','initial',[['cup','/k/'],['tree','/t/'],['hat','/h/']],'Recognize more initial speech sounds.'],
 ['Same starting sound','initialmatch',[['sun','sock','car','moon'],['ball','bed','sun','goat'],['cup','coat','dog','shoe']],'Compare the first sounds in named pictures.'],
 ['One different beginning','initialodd',[['sun','sock','cup'],['ball','bed','shoe'],['cup','coat','moon']],'Find the initial sound that differs.'],
 ['Blend two sounds','phonemeblend',[['shoe','/sh/ · vowel in shoe'],['key','/k/ · vowel in key'],['bee','/b/ · vowel in key']],'Blend two phonemes without requiring speech.'],
 ['Blend three sounds','phonemeblend',[['sun','/s/ · vowel in sun · /n/'],['cup','/k/ · vowel in sun · /p/'],['hat','/h/ · vowel in hat · /t/']],'Blend three phonemes into a word.'],
 ['Pebbles for little sounds','phonemes',[['shoe',2,'/sh/ · vowel in shoe'],['key',2,'/k/ · vowel in key'],['bee',2,'/b/ · vowel in key']],'Represent each phoneme with a counter.'],
 ['A pebble for each sound','phonemes',[['cup',3,'/k/ · vowel in sun · /p/'],['sun',3,'/s/ · vowel in sun · /n/'],['dog',3,'/d/ · vowel in dog · /g/']],'Segment simple three-phoneme words.'],
 ['Hear the last sound','final',[['cup','/p/'],['hat','/t/'],['sun','/n/']],'Attend to the final speech sound.'],
 ['Same ending sound','finalmatch',[['hat','boat','sun','shoe'],['dog','log','cup','hat'],['sun','moon','cup','bed']],'Match final phonemes, not whole rhymes.'],
 ['Sound explorer mix','review',[['sun','/s/ · vowel in sun · /n/'],['shoe',2,'/sh/ · vowel in shoe'],['hat','/t/']],'Revisit blending, segmenting, and final sounds.']
].map(([title,mode,items,skill])=>({title,mode,items,skill,object:items[0][0],exercise:'Use a few familiar objects or pictures. Name them consistently, model the spoken task, and let the child point or use counters. Keep it brief; do not require the child to pronounce the sounds.'}));
const adultCourseInfo={
 words:{title:'Words and Meanings',subtitle:'Vocabulary & word relationships',color:'#e7edde',symbol:'✧',adultRequired:true,icon:'apple',problem:'A child may recognize pictures but not understand the corresponding words, action names, describing words, or relationships in accessible language.',goal:'With an adult’s language model, connect familiar words and descriptions with pictures, actions, properties, categories, and real objects.',practice:'Object names, actions, attributes, categories, simple negatives, and combining two clues.',who:'May be useful for children with observed vocabulary or language-comprehension needs, including some children with developmental language disorder, autism, intellectual disability, or developmental delay. Children can answer without speaking.',limit:'Adult support is required throughout. Use speech, sign, or the child’s established AAC system; adapt the English prompts to the child’s language. A silent picture exercise alone does not teach vocabulary. Begin with familiar words, then model unfamiliar ones explicitly.',research:'Language is an important foundation for comprehension. These prototype games adapt explicit modeling and meaningful practice; they are not a validated language intervention or assessment.',source:'https://ies.ed.gov/ncee/wwc/Intervention/1830',games:wordCourseGames},
 sentences:{title:'Who Did What?',subtitle:'Sentences & relationships',color:'#e6ebf0',symbol:'↔',adultRequired:true,icon:'book',problem:'A child may know individual words yet miss who is acting, what is affected, a position word, or a small grammatical change in a sentence.',goal:'With an adult, connect short accessible sentences to pictured actions, actor–receiver roles, positions, quantities, and simple linked instructions.',practice:'Actors, actions, objects, reversible roles, positions, plural forms, negation, and two-part instructions.',who:'May be useful for children who struggle with sentence comprehension, including some children with developmental language disorder, autism, intellectual disability, or broader developmental delays. Use observed needs to choose the task.',limit:'Adult support is required throughout. Model the characters and actions first. Use the child’s accessible language; do not translate English grammar mechanically into a signed language. A language professional can help adapt contrasts. Pictures are simplified and sometimes need adult explanation.',research:'Sentence and listening comprehension are explicit early-language teaching targets. This illustrated course is a prototype, not a validated comprehension test or a substitute for individualized language support.',source:'https://ies.ed.gov/ncee/wwc/Intervention/1830',games:sentenceCourseGames},
 sounds:{title:'Sound Explorers',subtitle:'Spoken words, syllables & speech sounds',color:'#f2e7d5',symbol:'●',adultRequired:true,icon:'bee',problem:'A child may understand a word’s meaning but find it difficult to notice its syllables, blend its sounds, or identify the sound at its beginning or end.',goal:'An adult supplies spoken-English models while the child explores syllables, rhyme, initial and final phonemes, blending, and sound counters without needing to speak.',practice:'Syllables, rhyme, phoneme identification, blending, and segmentation. The progression is optional, not a prerequisite ladder.',who:'May be useful for children with observed phonological-awareness difficulties, including some children at risk of dyslexia or with language or speech-sound difficulties. Speaking ability is not required; access to the intended spoken sounds is needed.',limit:'Adult spoken support is required throughout. These examples are English-specific. Follow the child’s pronunciation and dialect; if syllable counts or rhymes differ, adapt or skip rather than mark the child wrong. Deaf or hard-of-hearing children may need a different language-accessible pathway planned with their team. Do not use this auditory course as a universal pathway.',research:'Phonemic-awareness instruction has evidence for targeted outcomes. This prototype has not been evaluated. Sound awareness can develop alongside print; do not delay letter–sound or reading instruction until every game is completed.',source:'https://pubs.asha.org/doi/10.1044/2022_LSHSS-21-00160',games:soundCourseGames}
};
Object.assign(newCourseInfo,adultCourseInfo);
