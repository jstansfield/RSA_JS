var charLength =256;//amount of arrays, your max number will be (256^(hexChars/2))^charLength
var hexCharsPerArray = 6;//has to be divisable by two. 4=Max size per array of 65536. 6=16777216 //MAX 6
var arrayMaxSize = Math.pow(256,(hexCharsPerArray/2));
var MAX_AND = arrayMaxSize/2;

var divideCount=0;
var largeMath = {
	addition: function  (a,b) {
		var mod = new Array;
		var cycle = new Array;
		cycle[charLength]=0;
		var result = new Array;
		var n;
		for (var x =(charLength-1);x>=0;x--){
			n = x+1;		
			cycle[x] = (Math.floor((a[x]+b[x]+cycle[n])/arrayMaxSize));		
			mod[x] = ((a[x]+b[x])%arrayMaxSize);
			result[x] =(mod[x]+cycle[n])%arrayMaxSize;
		}
		return result;
	},
	subtract: function (a,b){
		if (this.isGreater(a,b)){
			var mod = new Array;
			var cycle = new Array;
			cycle[charLength]=0;
			var result = new Array;
			var n;
			for (var x=(charLength-1); x>=0;x--){
				n = x+1;	
				if(a[x]-b[x]-cycle[n]<0){
					cycle[x]=1;
					mod[x] = (a[x]-b[x])+arrayMaxSize;
				}else{
					cycle[x]=0;
					mod[x] = a[x]-b[x];
				}
				result[x] =mod[x]-cycle[n];	
			}
			return result;
		}else{
			alert("Base value is smaller the subtracter");
		}
	},
	multiply: function (a,b){
		var mod = new Array;
		var cycle = new Array;
		cycle[charLength]=0;//sets an invalid array as zero it can be added to the modulus of the most insignificant array block
		var arraySum = new Array
		var result = new Array;
		for (var x =(charLength-1);x>=0;x--){
			arraySum[x]=0;
		}
		var p; //variable position
		var n;
		for (var x =(charLength-1);x>=0;x--){
			if (a[x]!=0 || b[x]!=0){
				for (var y =(charLength-1);y>=0;y--){	
					if (a[y]!=0 || b[y]!=0){
						p=(charLength-1)-(((charLength-1)-x)+((charLength-1)-y)); //
						arraySum[p] += a[x]*b[y];
					}
				}
			}
			
		}
		for (var x =(charLength-1);x>=0;x--){	
			n = x+1;
			cycle[x] = (Math.floor((arraySum[x]+cycle[n])/arrayMaxSize));		
			mod[x] = ((arraySum[x])%arrayMaxSize);
			result[x] =(mod[x]+cycle[n])%arrayMaxSize;
		}
		return result;
	},
	exponent: function(value,exponentBy,mod){
		var bitLength = hexCharsPerArray*4;
		var bitSize = Math.pow(2,bitLength-1);//8388608
		var result = new Array;
		var result = value;
		var activateSwitch = 0;
		//Run this algorithm http://www.youtube.com/watch?v=VAsBwBGGp2Y
		for(var x=0;x<charLength;x++){//scans through each array
				for(var y=0;y<bitLength;y++){//scans through each bit of value
					var scanValue = bitSize/Math.pow(2,y);
					var isSignificant = exponentBy[x] & scanValue;
					if (activateSwitch ==1){
						result =this.multiply (result,result)
						if (mod){
							result =this.divide(result,mod);
						}
						if (isSignificant>0){ //if required multiply the result the original value 
							result = this.multiply (result,value);
							if (mod){
								result = this.divide (result,mod);
							}
							
						}
					}
					
					if (isSignificant > 0 && activateSwitch ==0){//Allows the function to ignore first inital insignificant bits
						activateSwitch = 1;
					}
					
				}
				
			
		}
		return result;
	},
	divide: function (dividend,divisor){
		if(this.isGreater(dividend,divisor)){
			var dividendString = misc.binaryOutput(dividend);
			var divisorString = misc.binaryOutput(divisor);
			var divisorLength = divisorString.length;
			var dividendSectionString = dividendString.substr(0,divisorLength); 
			var dividendResidue = dividendString.substr(divisorLength).split('');
			var dividendResidueLength = dividendString.substr(divisorLength).length;
			var dividendSection = new Array;//string to array
			dividendSection = misc.arrayBinaryBlock(dividendSectionString);
			for(var x=-1;x<dividendResidueLength;x++){
				if (x!=-1){//shift and add residue bit
					dividendSection = this.miniShiftLeft(dividendSection);
					
					dividendSection[charLength-1]+=parseInt(dividendResidue[x],2);
				}
				if (this.isGreater(dividendSection,divisor)){
					dividendSection = this.subtract (dividendSection,divisor);
					
				}
				//
			}
			return dividendSection; 
		}
		return dividend;
	},
	isNegative: function (result){
		if(result[0]>=(arrayMaxSize-16)&&result[0]<=(arrayMaxSize-1)){//if the first array is within the range of 0xF0 to 0xFF, then the large number is a negative
			return true;
		}
		return false;
	},
	isGreater: function (a,b){//is A greater than B? true or false
		var result;
		if(this.isNegative(a) && !this.isNegative(b)){
			return false;
		}
		else if(this.isNegative(b) && !this.isNegative(a)){
			return true;
		}
		else if(this.isNegative(a) && this.isNegative(b)){
			for(var x=0;x<charLength;x++){
				if (a[x]!=b[x]){
					result = a[x]<b[x]?true:false;
					return result;
				}
			}
		}
		for(var x=0;x<charLength;x++){
			if (a[x]!=b[x]){
				result = a[x]>b[x]?true:false;
				return result;
			}
		}
		return true;//it is equal
	},
	shiftLeft: function (a){//take number and multiply by arrayMaxSize
		a[charLength]=0;
		var result = new Array;
		for (var x =(charLength-1);x>=0;x--){
			var n=x+1;
			result[x]=a[n];
		}
		return result;
	},
	miniShiftLeft: function (a){//take a numebr and shift all bits to the left
		var tempA=0;
		var tempB=0;
		var isSignificant =0;
		for (var x =(charLength-1);x>=0;x--){
			if(a[x]>0||tempB==1){
				isSignificant =  a[x]&MAX_AND;
				if(isSignificant>0){
					a[x]^=MAX_AND;
					tempA=1;
					isSignificant=0;
				}else{
					tempA=0;
				}
				a[x]<<=1;
				a[x]+=tempB;
				tempB=tempA;
			}
		}
		return a;
	}
}

var misc = {
	arrayBlock: function (data){//gets data and forms it into an array for manipulation
		if (data.length!=0){
			data = this.padData(data);
			var hexvalues = new Array();
			var count = 0;
			for (var x=0;x<charLength;x++){
				hexvalues[x] = parseInt(data.substring(count,count+hexCharsPerArray),16);
				
				count+=hexCharsPerArray;
			}
			return hexvalues;
		}
		
	},
	outputBlock: function (data){//gets array form of data and returns it to hex string
		var result= "";
		var activateSwitch =0 ;
		for (var x=0;x<charLength;x++){ 
			if(data[x]!=0){
				activateSwitch=1;
			}
			if (activateSwitch==1){	
				var padLength = hexCharsPerArray - data[x].toString(16).length ;
				var dataString = data[x].toString(16);
				for (var y=0;y<padLength;y++){
					dataString = "0"+dataString;
				}
				result  += data[x].toString(16).length  == 0 ?"000000":dataString;
				
			}
		}
		if (activateSwitch==0){
			result = "0";
		}
		return result;
	},
	padData: function (data,bin){//makes sure the string is the correct length by padding it with 0's
		var length = data.length;
		if (bin==true){
			var padding = (charLength*hexCharsPerArray*4) - length;
			for (padding;padding>0;padding--){
				data = '0' + data;
			}
		}
		else{
			var padding = (charLength*hexCharsPerArray) - length;
			for (padding;padding>0;padding--){
				data = '0' + data;
			}
		}
		return data;
	},
	binaryOutput: function (data){//gets array form of data and returns it to a binary string
		var result= "";
		var activateSwitch =0 ;
		var initial=true;
		for (var x=0;x<charLength;x++){ 
			if(data[x]!=0){
				activateSwitch=1;
			}
			if (activateSwitch==1){	
				if (initial==true){
					var padLength =0;
					initial=false;
				}else{
					var padLength = (hexCharsPerArray*4) - data[x].toString(2).length ;
				}
				var dataString = data[x].toString(2);
				for (var y=0;y<padLength;y++){
					dataString = "0"+dataString;
				}
				result  += data[x].toString(2).length  == 0 ?"000000000000000000000000":dataString;
				
			}
		}
		if (activateSwitch==0){
			result = "0";
		}
		return result;
	},
	arrayBinaryBlock: function (data){//gets data and forms it into an array for manipulation
		data = this.padData(data,true);
		var binaryValues = new Array();
		var count = 0;
		for (var x=0;x<charLength;x++){
			binaryValues[x] = parseInt(data.substring(count,count+hexCharsPerArray*4),2);	
			count+=hexCharsPerArray*4;
		}
		return binaryValues;
	},
	getMaxCharLength:function(base,n,mod){//scans values and generates largest neccesary size. use this before arrayblock() on all values;
		var max = (Math.ceil(Math.max(base.length,n.length,mod.length)/6)*2)+1;
		charLength = max;
	}
}

var resources = {
	expConstant: function() {
		var constant = "100";
		var expCon = misc.arrayBlock(constant);
		return expCon;
	},
	zero: function() {
		var constant = "0";
		var zero = misc.arrayBlock(constant);
		return zero;
	},
	doubleIt: function() {
		var constant = "2";
		var result = misc.arrayBlock(constant);
		return result;
	}
}
