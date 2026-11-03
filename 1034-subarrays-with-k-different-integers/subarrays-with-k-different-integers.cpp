class Solution {
public:
    int subarraysWithKDistinct(vector<int>& nums, int k) {
        return atMostK(nums, k) - atMostK(nums, k - 1);
    }
    
    int atMostK(vector<int>& nums, int k) {
        if (k == 0) return 0;   // Edge case
        
        int n = nums.size();
        int left = 0, ans = 0;
        unordered_map<int, int> freq;
        
        for (int right = 0; right < n; right++) {
            freq[nums[right]]++;
            
            while (freq.size() > k) {
                freq[nums[left]]--;
                if (freq[nums[left]] == 0) {
                    freq.erase(nums[left]);
                }
                left++;
            }
            
            ans += (right - left + 1);
        }
        return ans;
    }
};