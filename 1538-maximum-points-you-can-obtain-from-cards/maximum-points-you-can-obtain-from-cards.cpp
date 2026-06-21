class Solution {
public:
    int maxScore(vector<int>& cardPoints, int k) {
       int n =  cardPoints.size();
       int ls = 0 , rs = 0;
       int maxsum = 0 ;
       for (int i = 0;i<k;i++){
        ls = ls + cardPoints[i];
       }
       maxsum = ls;
       int rp = n-1;
       for (int i=k-1;i>=0;i--){
        ls = ls - cardPoints[i];
        rs = rs + cardPoints[rp];
        rp--;
        maxsum=max(maxsum,rs+ls);
       }
       return maxsum;
    }
};