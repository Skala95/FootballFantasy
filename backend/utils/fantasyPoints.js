import { FantasyTeam } from "../models/fantasyTeamModel.js";

const getMatchResult = (match) => {
    let goalsTeam1 = 0, goalsTeam2 = 0;

    match.stats.forEach(s => {
        const pid = (s.player?._id || s.player).toString();
        const inTeam1 = match.team1.some(p => (p._id || p).toString() === pid);

        if (s.stats === 'goal') {
            if (inTeam1) goalsTeam1++; else goalsTeam2++;
        } else if (s.stats === 'ownGoal') {
            if (inTeam1) goalsTeam2++; else goalsTeam1++;
        }
    });

    let winnerTeam = null;
    if (goalsTeam1 > goalsTeam2) winnerTeam = 'team1';
    else if (goalsTeam2 > goalsTeam1) winnerTeam = 'team2';

    return { goalsTeam1, goalsTeam2, winnerTeam };
};

export const calculateFantasyPoints = async (match) => {
    const fantasyTeams = await FantasyTeam.find({ match: match._id })
        .populate('selectedPlayers')
        .populate('captain');

    const { winnerTeam } = getMatchResult(match);

    for (const team of fantasyTeams) {
        let totalPoints = 0;

        const playerPointsArr = [];

        for (const player of team.selectedPlayers) {
            const playerId = player._id.toString();
            let playerPoints = 0;
            
            const playerInTeam1 = match.team1.some(p => (p._id || p).toString() === playerId);
            const playerInTeam2 = match.team2.some(p => (p._id || p).toString() === playerId);

            // Igrac je igrao (1 bod)
            if (playerInTeam1 || playerInTeam2) {
                playerPoints += 1; 

                // Pobeda tima (3 bod)
                if ((winnerTeam === 'team1' && playerInTeam1) || (winnerTeam === 'team2' && playerInTeam2)) {
                    playerPoints += 3;
                }

                match.stats.forEach(s => {
                    if((s.player?._id ? s.player._id : s.player).toString() === playerId) {
                        //Gol (5 bodova)
                        if (s.stats === 'goal') {
                            playerPoints += 5;
                        }
                        // Asistencija (2 boda)
                        else if (s.stats === 'assist') {
                            playerPoints += 2;
                        }            
                        // Autogol (-1 boda)
                        else if (s.stats === 'ownGoal') {
                            playerPoints -= 1;
                        }
                    }
                });
            }

            // Provera za kapitena
            const captainId = team.captain?._id?.toString() || team.captain.toString();
            // Kapiten dobija duple bodove
            if (captainId === playerId) {
                playerPoints *= 2; 
            }

            totalPoints += playerPoints;
            playerPointsArr.push({ player: player._id, points: playerPoints });

        }
        team.playerPoints = playerPointsArr;
        team.totalPoints = totalPoints;        
        await team.save();
    }
};

export const updatePlayerStats = async (match) => {
    const { Player } = await import('../models/playerModel.js');

    const { winnerTeam } = getMatchResult(match);

    const allPlayers = [
        ...match.team1.map(p => ({ player: p, team: 'team1' })),
        ...match.team2.map(p => ({ player: p, team: 'team2' }))
    ];

    for (const { player, team } of allPlayers) {
        const playerId = (player._id || player).toString();

        const goals = match.stats.filter(s =>
            (s.player?._id || s.player).toString() === playerId && s.stats === 'goal'
        ).length;
        const assists = match.stats.filter(s =>
            (s.player?._id || s.player).toString() === playerId && s.stats === 'assist'
        ).length;
        const ownGoals = match.stats.filter(s =>
            (s.player?._id || s.player).toString() === playerId && s.stats === 'ownGoal'
        ).length;

        let win = 0, loss = 0, draw = 0;
        if (winnerTeam === null) draw = 1;
        else if (winnerTeam === team) win = 1;
        else loss = 1;

        let pts = 1; // nastup
        pts += win * 3;
        pts += goals * 5;
        pts += assists * 2;
        pts -= ownGoals * 1;

        await Player.findByIdAndUpdate(playerId, {
            $inc: {
                appearances: 1,
                goals: goals,
                assists: assists,
                ownGoals: ownGoals,
                wins: win,
                losses: loss,
                draws: draw,
                totalPoints: pts
            }
        });
    }
};