class Solution {
public:
    int maxScore(vector<int>& nums, int k) {
        int n=nums.size();
        int lp=0;
        for(int i = 0; i<k;i++){
            lp=lp+nums[i];
        }
        int maxsum=lp;
        int rp=0;
        int rpindex=n-1;
        for (int i=k-1;i>=0;i--){
            lp=lp-nums[i];
            rp=rp+nums[rpindex];
            rpindex--;

            maxsum=max(maxsum,rp+lp);
        }
        return maxsum;
    }
};