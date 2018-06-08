/*!
 * Copyright 2018 CoNET Technology Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


	  
	  // =======================================================================
      /*
        +----+-----+-------+------+----------+----------+
        |VER | CMD |  RSV  | ATYP | DST.ADDR | DST.PORT |
        +----+-----+-------+------+----------+----------+
        | 1  |  1  | X'00' |  1   | Variable |    2     |
        +----+-----+-------+------+----------+----------+

        Where:

              o  VER    protocol version: X'05'
              o  CMD
                 o  CONNECT X'01'
                 o  BIND X'02'
                 o  UDP ASSOCIATE X'03'
              o  RSV    RESERVED
              o  ATYP   address type of following address
                 o  IP V4 address: X'01'
                 o  DOMAINNAME: X'03'
                 o  IP V6 address: X'04'
              o  DST.ADDR       desired destination address
              o  DST.PORT desired destination port in network octet
                 order
      */
	 const connectRequest = new Buffer ( '050100', 'hex' )
	 export const CMD = {
		 CONNECT: 0x1,
		 BIND: 0x2,
		 UDP_ASSOCIATE: 0x3
	 }
	 export const ATYP = {
		 IP_V4: 0x1,
		 DOMAINNAME: 0x03,
		 IP_V6: 0x4
	 }
	 
	 export const Replies = {
		 GRANTED: 0x0,
		 GENERAL_FAILURE: 0x1,
		 CONNECTION_NOT_ALLOWED_BY_RULESET: 0x2,
		 NETWORK_UNREACHABLE: 0x3,
		 HOST_UNREACHABLE: 0x4,
		 CONNECTION_REFUSED_BY_DESTINATION_HOST: 0x5,
		 TTL_EXPIRED: 0x6,
		 COMMAND_NOT_SUPPORTED_or_PROTOCOL_ERROR: 0x7,
		 ADDRESS_TYPE_NOT_SUPPORTED: 0x8
	 }
	 //		state 
		 const STATE_VERSION = 0
		 const STATE_METHOD = 1
		 const STATE_REP_STATUS = 2
		 const STATE_REP_RSV = 3
		 const STATE_REP_ATYP = 4
		 const STATE_REP_BNDADDR = 5
		 const STATE_REP_BNDADDR_VARLEN = 6
		 const STATE_REP_BNDPORT = 7
	 //		end stats
	 //		reply Buffer
		 
		 const reply_NO_AUTHENTICATION_REQUIRED = new Buffer ( '0500', 'hex' )
		 const reply_GSSAPI = new Buffer ( '0501', 'hex' )
		 const reply_USERNAME_PASSWORD = new Buffer ( '0502', 'hex' )
		 const reply_to_x7F_IANA_ASSIGNED = new Buffer ( '0503', 'hex' )
		 const reply_to_xFE_RESERVED_FOR_PRIVATE_METHODS = new Buffer ( '0580', 'hex' )
		 const reply_NO_ACCEPTABLE_METHODS = new Buffer ( '05ff', 'hex' )
	 //		end reply Buffer
	 
	 export class  Requests {
	 
		 constructor ( public buffer: Buffer ) {}
		 public get socketVersion () {
			 return this.buffer.readUInt8 ( 0 )
		 }
		 
		 public get IsSocket5 () {
			 return this.buffer.readUInt8 ( 0 ) === 0x05
		 }
		 public get NMETHODS () {
			 return this.buffer.readUInt8 ( 1 )
		 }
		 public get METHODS () {
			 return this.buffer.readUInt8 ( 2 )
		 }
		 public get isRequests () {
			 return this.buffer.length > 3
		 }
		 public get domainLength () {
			 return this.buffer.readUInt8 ( 4 )
		 }
		 public get domainName () {
			 if ( this.ATYP !== ATYP.DOMAINNAME )
				 return null
			 return this.buffer.toString ( 'utf8', 5, 5 + this.domainLength )
		 }
		 public get ATYP () {
			 return this.buffer.readInt8 ( 3 )
		 }
		 public set_V5 () {
			 this.buffer.writeUInt8 (5,0)
		 }
		 public set status ( n: number ) {
			 this.buffer.writeUInt8 ( n, 1 )
		 }
	 
		 public get ATYP_IP4Address () {
			 if ( this.ATYP !== ATYP.IP_V4 )
				 return null
			 return `${ this.buffer.readUInt8 (4).toString() }.${ this.buffer.readUInt8 (5).toString() }.${ this.buffer.readUInt8 (6).toString() }.${ this.buffer.readUInt8 (7).toString() }`
		 }
	 
		 public get port () {
			 if ( this.ATYP === ATYP.DOMAINNAME ) {
				 const length = this.buffer.readUInt8 ( 4 )
				 return this.buffer.readUInt16BE ( 5 + length )
			 }
			 if ( this.ATYP === ATYP.IP_V6 )
				 return this.buffer.readUInt16BE ( 19 )
			 return this.buffer.readUInt16BE ( 8 )
		 }
	 
		 public get IPv6 () {
			 if ( this.ATYP !== ATYP.IP_V6 )
				 return null
			 return `${ this.buffer.readUInt32BE (4).toString (16) }:${ this.buffer.readUInt32BE (8).toString(16) }:${ this.buffer.readUInt32BE (12).toString(16) }:${ this.buffer.readUInt32BE (16).toString (16) }`
		 }
	 
		 public get cmd () {
			 return this.buffer.readUInt8 (1)
		 }
	 
	   public set serverIP ( n: string ) {
		   this.buffer = Buffer.alloc ( 22 )
		   this.set_V5 ()
		   this.buffer.writeUInt8 ( 1, 3 )
		   const y = n.split ( '.' )
		   for ( let i = 0, j = 4; i < 4; i ++, j++ ) {
			   const k = parseInt ( y[i] )
			   if ( isNaN (k) || k < 0 || k > 255 ) {
				   console.log ( `serverIP ERROR! k = [${ k }] ip[${ n }]`)
				   break 
			   }
				   
			   this.buffer.writeUInt8 ( k, j )
		   }
		   console.log (`setup serverIP: buffer [${ this.buffer.toString('hex')}]`)
	   }
	 
		 public set REP ( n: number ) {
			 this.buffer.writeUInt8 ( n, 1 )
		 }
	 
		 public get host () {
			 return this.ATYP_IP4Address || this.domainName || this.IPv6
		 }

		 public set port ( port: number ) {
			   this.buffer.writeUInt16BE ( port, 20 )
		 } 
		 
	 }

	 export class socket4Requests {
	   constructor ( public buffer: Buffer ) {}
	   public get socketVersion () {
		   return this.buffer.readUInt8 ( 0 )
	   }
	   public get IsSocket4 () {
		   return this.buffer.readUInt8 ( 0 ) === 0x04
	   }
	   public get cmd () {
		   return this.buffer.readUInt8 ( 1 )
	   }
	   public get port () {
		   return this.buffer.readUInt16BE ( 2 )
	   }
	   public get targetIp () {
		   const uu = `${ this.buffer.readUInt8 (4).toString() }.${ this.buffer.readUInt8 (5).toString() }.${ this.buffer.readUInt8 (6).toString() }.${ this.buffer.readUInt8 (7).toString() }`
		   if ( /^0.0.0/.test (uu))
			   return null
		   return uu
	   }
	   public get domainName () {
		   if ( ! this.targetIp ) {
			   return this.buffer.slice (9).toString ()
		   }
		   return null
	   }

	   public request_4_granted ( targetIp: string, targetPort: number) {
		   if ( !targetIp )
			   return Buffer.from ('005a000000000000','hex')
		   const ret = Buffer.from ('005a000000000000','hex')
		   ret.writeUInt16BE ( targetPort, 2 )
		   const u = targetIp.split ('.')
		   for ( let i = 4, l = 0; i < 8; i ++, l ++ ) {

			   ret.writeUInt8 ( parseInt (u[l]), i )
		   }
		   return ret
	   }
	   public get request_failed () {
		   return Buffer.from ('005b000000','hex')
	   }

	 }
	 