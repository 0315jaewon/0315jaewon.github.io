**Introduction**

Gomoku is a 2-player strategy board game where players take turns placing stones on the board,
with a primary goal of forming a continuous line of five pieces. I started this project during my
first vacation from the army, after having played the game numerous times with my comrades.

**About**

The starting player places black stones on the board, and the player going second places white stones.
Due to the large advantage of the starting player, there are several restrictions that balance the game:
1. The starting player is not allowed to place stones in a location where two separate formations of
three stones would simultaneously be created.
2. Similarly, the starting player is not allowed to place stones in a location where two separate
formations of four stones would simultaneously be created.
3. The starting player is not allowed to place stones on a location where a connected line of six or
more stones would be created.

**Notes**

This project is still a work-in-progress, as I've yet to implement the restrictions to the starting
player that I mentioned above. 

**FAQ**

How do I play the game?
Open the gomoku.html file, and click on any vertex on the board to place a stone.

There seems to be a bug (e.g. stones are being placed outside of the board)!
Feel free to shoot me an email at changjaewon0315@berkeley.edu describing the bug in detail :)
