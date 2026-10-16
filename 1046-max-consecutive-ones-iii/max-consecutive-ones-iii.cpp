class Solution {
public:
    int longestOnes(vector<int>& nums, int k) {
        int n = nums.size();
        int rp = 0 ,lp =0;
        int zero = 0 , maxlen = 0, len=0;
        
        while (rp<n){
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
                len = rp-lp+1;
                maxlen=max(maxlen,len);
                rp++;
            }
        }
        return maxlen;
    }
};