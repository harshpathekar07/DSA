class Solution {
public:
    int longestOnes(vector<int>& nums, int k) {
        int n = nums.size();
        int maxlen = 0;
        int rp = 0 , lp = 0;
        int zero= 0;
        while(rp<n){
            
            if (nums[rp]==0){
                zero++;
            }
            while (zero>k){
                if (nums[lp]==0){
                    zero--;
                }
                lp++;
            }
            if (zero<=k){
                maxlen=max(maxlen,rp-lp+1);
            }
            rp++;
        }
        return maxlen;
    }
};