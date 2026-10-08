class Solution {
public:
    int numRescueBoats(vector<int>& nums, int limit) {
        int x = 0;
        sort(nums.begin(),nums.end());
        int lp = 0 , rp = nums.size()-1;
        while (lp<=rp){
            if(nums[lp]+nums[rp]<=limit){
                lp++;
            }
            rp--;
            x++;
        }
        return x;
    }
};