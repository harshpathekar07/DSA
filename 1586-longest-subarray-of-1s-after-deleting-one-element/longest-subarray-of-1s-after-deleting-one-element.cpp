class Solution {
public:
    int longestSubarray(vector<int>& nums) {
        int maxlen = 0;
        int n = nums.size();
        int count = 0;
        int rp = 0, lp = 0;
        for (int rp = 0; rp < n; rp++) {
            if (nums[rp] == 0) {
                count++;
            }
            while (count > 1) {
                if (nums[lp] == 0) {
                    count--;
                }
                lp++;
            }
            maxlen = max(maxlen, rp - lp + 1);
        }
        return maxlen - 1;
    }
};