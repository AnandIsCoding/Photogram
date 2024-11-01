Here I will write steps or todo for server side code writing journey

1. setup backend folder and install all required packages 
2. create models for all required collection such as User, Post, Comment, Message, Conversation
3. create .env file and all important keys will be stored here only
4. setup database using atlas cluster, create a get /ping request and check in postman

In controllers create a file for user controller
       1. create SignupUser (using email etc and hashed password and think apply logic write step by step) 
       2. create LoginUser 
       3. create logout
       4. create getProfile
       4. create editProfile





1. Follow
When User A (the one who wants to follow) clicks "Follow" on User B's profile:
  We add User B's ID to User A's list of "following" (this is the list of people User A follows).
  We also add User A's ID to User B's list of "followers" (this is the list of people who follow User B).
2. Unfollow
  When User A clicks "Unfollow" on User B's profile:
  We remove User B's ID from User A's "following" list.
  We also remove User A's ID from User B's "followers" list.