# redis-aof-to-plain-converter

Simple tool usable for importing data from aof file to a new redis-cluster with diffrent configuration

Tool converts

	*2
	$6
	SELECT
	$1
	0
	*8
	$5
	HMSET
	$13
	HSET:USER:cms
	$8
	password
	$40
	fdaad7328c6da36e8cc63409d6acc5109bfa463b
	$10
	permission
	$2
	32
	$16
	token_expiration
	$7
	2592000

To

	"SELECT" "0"
	"HMSET" "HSET:USER:cms" "password" "fdaad7328c6da36e8cc63409d6acc5109bfa463b" "permission" "32" "token_expiration" "2592000"

redis-cli can work with this format in cluster mode

	node index.js test.aof
	node index.js test.aof > plain.txt`
	node index.js test.aof | redis-cli -c -p 7011 -h localhost