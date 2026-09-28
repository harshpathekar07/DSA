class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        unordered_map<int, int> freq;
        int index = 0;
        for (int num : nums) {
            if (freq[num] == 0) {      
                freq[num] = 1;         
                nums[index] = num;
                index++;
            }
        }
        return index;
    }
};