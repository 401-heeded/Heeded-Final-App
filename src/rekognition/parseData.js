'use strict';

function parseData ( rawData, engagementThreshold ) {
  if ( rawData ) {
    let frameData = rawData.reduce( ( dataCount, person ) => {
      if ( Math.abs( person.Pose.Yaw ) < engagementThreshold && Math.abs( person.Pose.Pitch ) < engagementThreshold ) {
        dataCount.Engaged++;
      } else {
        dataCount.Unengaged++;
      }
      dataCount.Average = dataCount.Engaged / (dataCount.Engaged + dataCount.Unengaged);
      return dataCount;
    }, { Engaged: 0, Unengaged: 0, Average: 0 });
    console.log(`Engaged: ${frameData.Engaged} , Unengaged:${frameData.Unengaged}, Average:${frameData.Average}`);
    return frameData;
  }
}

module.exports = parseData;
