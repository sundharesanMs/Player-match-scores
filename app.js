const express = require('express')
const path = require('path')
const app = express()

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketMatchDetails.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

// player table function
const convertPlayer = dbObject => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  }
}

// first tah 1------------------------------------------- api 1 --------------

initializeDBAndServer()

app.get('/players/', async (request, response) => {
  const getplayerQuery = `select 
  player_id as playerId, 
  player_name as playerName
   from   
   player_details; `
  const playerArray = await db.all(getplayerQuery)
  response.send(playerArray)
})
// secon tag return the specific ------------------------------api 2 ----------------

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params

  const getplayerQuery = `select 
   player_id as playerId, 
  player_name as playerName
   from   
   player_details
   where 
   player_id = ${playerId}; `
  const secondResult = await db.get(getplayerQuery)
  response.send(secondResult)
})

//....third tag -----------api 3----------------------
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body
  const updateQuery = `UPDATE player_details
SET
player_name = '${playerName}'
WHERE player_id = ${playerId};`
  await db.run(updateQuery)
  response.send('Player Details Updated')
})

//.........api 4 .................................//
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getApiFour = `select * 
  from 
  match_details 
  where 
  match_id = ${matchId}; `
  const ApiFourResult = await db.get(getApiFour)
  response.send(convertPlayer(ApiFourResult))
})

//............................aPI 5........................//

app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const getApiFive = `select *from player_match_score natural join match_details 
  where player_id = ${playerId}; `
  const resultApiFive = await db.all(getApiFive)
  response.send(resultApiFive.map(eachMatch => convertPlayer(eachMatch)))
})

//...........................api 6 ........................-------------------------//
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getApiSix = `select * from player_match_score natural join player_details 
  where match_id = ${matchId}; `
  const resultApiSix = await db.all(getApiSix)
  response.send(resultApiSix.map(eachMatch => convertPlayer(eachMatch)))
})

//.................Api 7 ...............................................//
app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const getMatchPlayerQuery = `select 
player_id as playerId,
player_name as playerName, 
sum(score) as totalscore, 
sum(fours) as totalFours, 
sum(sixes) as totalSixes
from player_match_score 
natural join player_details 
where 
player_id = ${playerId};`
  const resultApiSeven = await db.get(getMatchPlayerQuery)
  response.send(resultApiSeven)
})

module.exports = app
