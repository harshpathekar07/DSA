class Solution {
public:
    int minSubArrayLen(int target, vector<int>& nums) {
        int n = nums.size();
        int left = 0;
        int windowSum = 0;
        int minLen = INT_MAX;
        for (int right = 0; right < n; right++) {
            windowSum += nums[right];
            while (windowSum >= target) {
                minLen = min(minLen, right - left + 1);
                windowSum -= nums[left];
                left++;
            }
        }
        return minLen == INT_MAX ? 0 : minLen;
    }
};