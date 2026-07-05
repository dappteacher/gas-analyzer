// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Sample {

    uint8[] myTokens;
    constructor(){
        myTokens = [100,90,88];
    }
    function sumNumbers() external view returns (uint256){
        uint256 sum = 0 ;
        uint256 length = myTokens.length;
        for (uint8 i=0; i < length;){
            sum += myTokens[i];
            unchecked {
                i++;
            }
        }
        return sum;
    }
}